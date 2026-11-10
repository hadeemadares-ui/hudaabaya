// Cloudflare Pages Function for Realtime Multi-Device Sync (/api/sync)

interface SyncBundle {
  version: number;
  products: any[];
  deletedIds: string[];
  orders: any[];
  deletedOrderIds: string[];
  stockMovements: any[];
  deletedStockMovementIds: string[];
  supplierSettlements: any[];
  supplierReturnVouchers?: any[];
  deletedSupplierReturnIds?: string[];
  eventSchedules: any[];
  deletedEventScheduleIds: string[];
  eventBranches: string[];
  boothTransfers?: any[];
  deletedBoothTransferIds?: string[];
  staffUsers?: any[];
  settings: any;
  customOptions: any;
}

let cachedBundle: SyncBundle | null = null;
let lastCacheFetchTime = 0;
const CACHE_TTL_MS = 500; // 0.5s ultra-fast edge memory TTL for instant multi-device sync

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

function getEmptyBundle(version = Date.now()): SyncBundle {
  return {
    version,
    products: [],
    deletedIds: [],
    orders: [],
    deletedOrderIds: [],
    stockMovements: [],
    deletedStockMovementIds: [],
    supplierSettlements: [],
    supplierReturnVouchers: [],
    deletedSupplierReturnIds: [],
    eventSchedules: [],
    deletedEventScheduleIds: [],
    eventBranches: [],
    boothTransfers: [],
    deletedBoothTransferIds: [],
    staffUsers: [],
    settings: null,
    customOptions: null,
  };
}

async function fetchBundleFromD1OrKV(env: any): Promise<SyncBundle | null> {
  let kvBundle: SyncBundle | null = null;
  let d1Bundle: SyncBundle | null = null;

  // 1. Try Cloudflare KV (has 25MB capacity, stores complete multi-device data)
  if (env?.HUDA_KV) {
    try {
      const raw = await env.HUDA_KV.get('huda_sync_bundle');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          kvBundle = parsed as SyncBundle;
        }
      }
    } catch (err: any) {
      console.warn('HUDA_KV get bundle notice:', err?.message);
    }
  }

  // 2. Try D1
  if (env?.DB) {
    try {
      const row: any = await env.DB.prepare(
        "SELECT val FROM sync_store WHERE key = ?"
      ).bind('huda_sync_bundle').first();
      if (row?.val) {
        const parsed = JSON.parse(row.val);
        if (parsed && typeof parsed === 'object') {
          d1Bundle = parsed as SyncBundle;
        }
      }
    } catch (err: any) {
      console.warn('D1 fetch notice:', err?.message);
    }
  }

  // Return whichever has the newer timestamped version!
  if (kvBundle && d1Bundle) {
    return (kvBundle.version || 0) >= (d1Bundle.version || 0) ? kvBundle : d1Bundle;
  }
  return kvBundle || d1Bundle || null;
}

async function saveBundleToD1AndKV(env: any, bundle: SyncBundle): Promise<boolean> {
  let ok = false;

  // 1. Save to KV (dual persistence with 25MB limit)
  if (env?.HUDA_KV) {
    try {
      await Promise.all([
        env.HUDA_KV.put('huda_sync_bundle', JSON.stringify(bundle)),
        env.HUDA_KV.put('huda_sync_version', bundle.version.toString()),
      ]);
      ok = true;
    } catch (err: any) {
      console.warn('HUDA_KV save bundle notice:', err?.message);
    }
  }

  // 2. Save to D1 (check payload length to prevent D1 statement size error)
  if (env?.DB) {
    try {
      const serialized = JSON.stringify(bundle);
      if (serialized.length < 950000) {
        await env.DB.prepare(
          "INSERT INTO sync_store (key, val, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET val=excluded.val, updated_at=excluded.updated_at"
        ).bind('huda_sync_bundle', serialized, bundle.version).run();
        ok = true;
      }
    } catch (err: any) {
      console.warn('D1 save notice:', err?.message);
    }
  }

  return ok;
}

export async function onRequestGet(context: any) {
  try {
    const url = new URL(context.request.url);
    const clientVersion = parseInt(url.searchParams.get('v') || '0', 10);
    const isForced = url.searchParams.get('force') === '1' || url.searchParams.get('force') === 'true' || clientVersion === 0;

    const env = context.env;
    const now = Date.now();

    // 1. Quick in-memory version check (Respects fresh edge TTL)
    if (!isForced && clientVersion > 0 && cachedBundle && cachedBundle.version > 0 && clientVersion >= cachedBundle.version) {
      if (now - lastCacheFetchTime <= CACHE_TTL_MS) {
        return new Response(
          JSON.stringify({
            success: true,
            upToDate: true,
            version: cachedBundle.version,
            serverTimeUTC: new Date().toISOString(),
          }),
          { headers: corsHeaders }
        );
      }
    }

    // 2. Refresh cache from D1 / KV if expired or not yet loaded
    if (!cachedBundle || now - lastCacheFetchTime > CACHE_TTL_MS) {
      const freshBundle = await fetchBundleFromD1OrKV(env);
      if (freshBundle) {
        cachedBundle = freshBundle;
        lastCacheFetchTime = now;
      }
    }

    // Fallback if both D1 & KV were empty or unavailable
    if (!cachedBundle) {
      cachedBundle = getEmptyBundle(now);
    }

    // 3. Re-verify version after fetching fresh bundle
    if (!isForced && clientVersion > 0 && cachedBundle.version > 0 && clientVersion >= cachedBundle.version) {
      return new Response(
        JSON.stringify({
          success: true,
          upToDate: true,
          version: cachedBundle.version,
          serverTimeUTC: new Date().toISOString(),
        }),
        { headers: corsHeaders }
      );
    }

    // 4. Return full bundle payload
    return new Response(
      JSON.stringify({
        success: true,
        upToDate: false,
        version: cachedBundle.version,
        products: cachedBundle.products || [],
        deletedIds: cachedBundle.deletedIds || [],
        orders: cachedBundle.orders || [],
        deletedOrderIds: cachedBundle.deletedOrderIds || [],
        stockMovements: cachedBundle.stockMovements || [],
        deletedStockMovementIds: cachedBundle.deletedStockMovementIds || [],
        supplierSettlements: cachedBundle.supplierSettlements || [],
        supplierReturnVouchers: cachedBundle.supplierReturnVouchers || [],
        deletedSupplierReturnIds: cachedBundle.deletedSupplierReturnIds || [],
        eventSchedules: cachedBundle.eventSchedules || [],
        deletedEventScheduleIds: cachedBundle.deletedEventScheduleIds || [],
        eventBranches: cachedBundle.eventBranches || [],
        boothTransfers: cachedBundle.boothTransfers || [],
        deletedBoothTransferIds: cachedBundle.deletedBoothTransferIds || [],
        staffUsers: cachedBundle.staffUsers || [],
        settings: cachedBundle.settings || null,
        customOptions: cachedBundle.customOptions || null,
        serverTimeUTC: new Date().toISOString(),
      }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestPost(context: any) {
  try {
    const env = context.env;
    const body = await context.request.json();
    const newVersion = Date.now();

    // 1. Ensure freshest bundle is loaded before applying updates
    const freshBundle = await fetchBundleFromD1OrKV(env);
    if (freshBundle) {
      cachedBundle = freshBundle;
    } else if (!cachedBundle) {
      cachedBundle = getEmptyBundle(newVersion);
    }

    const cur = cachedBundle;

    // 2. Merge or Replace incoming data
    let updatedProducts = cur.products || [];
    let updatedDeletedIds = cur.deletedIds || [];
    let updatedOrders = cur.orders || [];
    let updatedDeletedOrderIds = cur.deletedOrderIds || [];
    let updatedMovements = cur.stockMovements || [];
    let updatedDeletedStockMovementIds = cur.deletedStockMovementIds || [];
    let updatedSettlements = cur.supplierSettlements || [];
    let updatedReturnVouchers = cur.supplierReturnVouchers || [];
    let updatedDeletedReturnIds = cur.deletedSupplierReturnIds || [];
    let updatedSchedules = cur.eventSchedules || [];
    let updatedDeletedEventIds = cur.deletedEventScheduleIds || [];
    let updatedBranches = cur.eventBranches || [];
    let updatedBoothTransfers = cur.boothTransfers || [];
    let updatedDeletedBoothTransferIds = cur.deletedBoothTransferIds || [];
    let updatedStaffUsers = cur.staffUsers || [];
    let updatedSettings = cur.settings;
    let updatedOptions = cur.customOptions || {};

    if (body.replace_all) {
      if (Array.isArray(body.products)) updatedProducts = body.products;
      if (Array.isArray(body.deletedIds)) updatedDeletedIds = body.deletedIds;
      if (Array.isArray(body.orders)) updatedOrders = body.orders;
      if (Array.isArray(body.deletedOrderIds)) updatedDeletedOrderIds = body.deletedOrderIds;
      if (Array.isArray(body.stockMovements)) updatedMovements = body.stockMovements;
      if (Array.isArray(body.deletedStockMovementIds)) updatedDeletedStockMovementIds = body.deletedStockMovementIds;
      if (Array.isArray(body.supplierSettlements)) updatedSettlements = body.supplierSettlements;
      if (Array.isArray(body.supplierReturnVouchers)) updatedReturnVouchers = body.supplierReturnVouchers;
      if (Array.isArray(body.deletedSupplierReturnIds)) updatedDeletedReturnIds = body.deletedSupplierReturnIds;
      if (Array.isArray(body.eventSchedules)) updatedSchedules = body.eventSchedules;
      if (Array.isArray(body.deletedEventScheduleIds)) updatedDeletedEventIds = body.deletedEventScheduleIds;
      if (Array.isArray(body.eventBranches)) updatedBranches = body.eventBranches;
      if (Array.isArray(body.boothTransfers)) updatedBoothTransfers = body.boothTransfers;
      if (Array.isArray(body.deletedBoothTransferIds)) updatedDeletedBoothTransferIds = body.deletedBoothTransferIds;
      if (Array.isArray(body.staffUsers)) updatedStaffUsers = body.staffUsers;
      if (body.settings && typeof body.settings === 'object') updatedSettings = body.settings;
      if (body.customOptions && typeof body.customOptions === 'object') updatedOptions = body.customOptions;
    } else {
      // Products & Deletions
      if (Array.isArray(body.deletedIds)) {
        updatedDeletedIds = Array.from(new Set([...updatedDeletedIds, ...body.deletedIds]));
      }

      if (Array.isArray(body.products)) {
        const prodMap = new Map<string, any>();
        (cur.products || []).forEach((p: any) => prodMap.set(p.id, p));
        body.products.forEach((p: any) => {
          if (!updatedDeletedIds.includes(p.id)) {
            prodMap.set(p.id, p);
          }
        });
        updatedProducts = Array.from(prodMap.values()).filter((p: any) => !updatedDeletedIds.includes(p.id));
      }

      // Orders & Deletions
      if (Array.isArray(body.deletedOrderIds)) {
        updatedDeletedOrderIds = Array.from(new Set([...updatedDeletedOrderIds, ...body.deletedOrderIds]));
      }

      if (Array.isArray(body.orders)) {
        const incomingOrderIds = new Set(body.orders.map((o: any) => o.id));
        updatedDeletedOrderIds = updatedDeletedOrderIds.filter((id: string) => !incomingOrderIds.has(id));

        const orderMap = new Map<string, any>();
        (cur.orders || []).forEach((o: any) => {
          if (!updatedDeletedOrderIds.includes(o.id)) orderMap.set(o.id, o);
        });
        body.orders.forEach((o: any) => {
          if (!updatedDeletedOrderIds.includes(o.id)) {
            const existing = orderMap.get(o.id);
            if (!existing) {
              orderMap.set(o.id, o);
            } else {
              const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
              const incomingTime = new Date(o.updatedAt || o.createdAt || 0).getTime();
              orderMap.set(o.id, incomingTime >= existingTime ? o : existing);
            }
          }
        });
        updatedOrders = Array.from(orderMap.values())
          .filter((o: any) => !updatedDeletedOrderIds.includes(o.id))
          .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      } else if (Array.isArray(body.deletedOrderIds)) {
        updatedOrders = (cur.orders || []).filter((o: any) => !updatedDeletedOrderIds.includes(o.id));
      }

      // Stock Movements & Deletions / Restorations
      if (Array.isArray(body.deletedStockMovementIds)) {
        updatedDeletedStockMovementIds = Array.from(new Set([...updatedDeletedStockMovementIds, ...body.deletedStockMovementIds]));
      }

      if (Array.isArray(body.stockMovements)) {
        const incomingIds = new Set(body.stockMovements.map((m: any) => m.id));
        updatedDeletedStockMovementIds = updatedDeletedStockMovementIds.filter((id: string) => !incomingIds.has(id));

        const movMap = new Map<string, any>();
        (cur.stockMovements || []).forEach((m: any) => {
          if (!updatedDeletedStockMovementIds.includes(m.id)) movMap.set(m.id, m);
        });
        body.stockMovements.forEach((m: any) => {
          if (!updatedDeletedStockMovementIds.includes(m.id)) movMap.set(m.id, m);
        });
        updatedMovements = Array.from(movMap.values())
          .filter((m: any) => !updatedDeletedStockMovementIds.includes(m.id))
          .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      } else if (Array.isArray(body.deletedStockMovementIds)) {
        updatedMovements = (cur.stockMovements || []).filter((m: any) => !updatedDeletedStockMovementIds.includes(m.id));
      }

      // Supplier Settlements
      if (Array.isArray(body.supplierSettlements)) {
        const setMap = new Map<string, any>();
        (cur.supplierSettlements || []).forEach((s: any) => setMap.set(s.id, s));
        body.supplierSettlements.forEach((s: any) => setMap.set(s.id, s));
        updatedSettlements = Array.from(setMap.values()).sort(
          (a: any, b: any) => new Date(b.settledAt || 0).getTime() - new Date(a.settledAt || 0).getTime()
        );
      }

      // Event Schedules
      if (Array.isArray(body.deletedEventScheduleIds)) {
        updatedDeletedEventIds = Array.from(new Set([...updatedDeletedEventIds, ...body.deletedEventScheduleIds]));
      }

      if (Array.isArray(body.eventSchedules)) {
        const schMap = new Map<string, any>();
        (cur.eventSchedules || []).forEach((s: any) => {
          if (!updatedDeletedEventIds.includes(s.id)) schMap.set(s.id, s);
        });
        body.eventSchedules.forEach((s: any) => {
          if (!updatedDeletedEventIds.includes(s.id)) schMap.set(s.id, s);
        });
        updatedSchedules = Array.from(schMap.values())
          .filter((s: any) => !updatedDeletedEventIds.includes(s.id))
          .sort((a: any, b: any) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
      } else if (Array.isArray(body.deletedEventScheduleIds)) {
        updatedSchedules = (cur.eventSchedules || []).filter((s: any) => !updatedDeletedEventIds.includes(s.id));
      }

      // Event Branches
      if (Array.isArray(body.eventBranches)) {
        updatedBranches = Array.from(new Set([...(cur.eventBranches || []), ...body.eventBranches]));
      }

      // Booth Transfers & Deletions
      if (Array.isArray(body.deletedBoothTransferIds)) {
        updatedDeletedBoothTransferIds = Array.from(new Set([...updatedDeletedBoothTransferIds, ...body.deletedBoothTransferIds]));
      }

      if (Array.isArray(body.boothTransfers)) {
        const transferMap = new Map<string, any>();
        (cur.boothTransfers || []).forEach((t: any) => {
          if (!updatedDeletedBoothTransferIds.includes(t.id)) transferMap.set(t.id, t);
        });
        body.boothTransfers.forEach((t: any) => {
          if (!updatedDeletedBoothTransferIds.includes(t.id)) {
            const existing = transferMap.get(t.id);
            if (!existing) {
              transferMap.set(t.id, t);
            } else {
              const existingTime = existing ? (new Date(existing.updatedAt || existing.createdAt || 0).getTime() || 0) : 0;
              const incomingTime = t ? (new Date(t.updatedAt || t.createdAt || 0).getTime() || 0) : 0;
              transferMap.set(t.id, incomingTime >= existingTime ? t : existing);
            }
          }
        });
        updatedBoothTransfers = Array.from(transferMap.values())
          .filter((t: any) => !updatedDeletedBoothTransferIds.includes(t.id))
          .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      } else if (Array.isArray(body.deletedBoothTransferIds)) {
        updatedBoothTransfers = (cur.boothTransfers || []).filter((t: any) => !updatedDeletedBoothTransferIds.includes(t.id));
      }

      // Staff Users (Merge by ID so no device overwrites existing staff)
      if (Array.isArray(body.staffUsers) && body.staffUsers.length > 0) {
        const staffMap = new Map<string, any>();
        (cur.staffUsers || []).forEach((u: any) => { if (u && u.id) staffMap.set(u.id, u); });
        body.staffUsers.forEach((u: any) => { if (u && u.id) staffMap.set(u.id, u); });
        if (Array.isArray(body.deletedStaffUserIds)) {
          body.deletedStaffUserIds.forEach((delId: string) => staffMap.delete(delId));
        }
        updatedStaffUsers = Array.from(staffMap.values());
      }

      // Settings
      if (body.settings && typeof body.settings === 'object') {
        updatedSettings = { ...(cur.settings || {}), ...body.settings };
      }

      // Custom Options
      if (body.customOptions && typeof body.customOptions === 'object') {
        updatedOptions = {
          suppliers: Array.from(new Set([...(cur.customOptions?.suppliers || []), ...(body.customOptions.suppliers || [])])),
          stockInNotes: Array.from(new Set([...(cur.customOptions?.stockInNotes || []), ...(body.customOptions.stockInNotes || [])])),
          categories: body.customOptions.categories || cur.customOptions?.categories || [],
          fabrics: { ...(cur.customOptions?.fabrics || {}), ...(body.customOptions.fabrics || {}) },
          sizes: { ...(cur.customOptions?.sizes || {}), ...(body.customOptions.sizes || {}) },
          colors: { ...(cur.customOptions?.colors || {}), ...(body.customOptions.colors || {}) },
          descriptions: Array.from(new Set([...(cur.customOptions?.descriptions || []), ...(body.customOptions.descriptions || [])])),
        };
      }
    }

    // 3. Update in-memory cache immediately
    const updatedBundle: SyncBundle = {
      version: newVersion,
      products: updatedProducts,
      deletedIds: updatedDeletedIds,
      orders: updatedOrders,
      deletedOrderIds: updatedDeletedOrderIds,
      stockMovements: updatedMovements,
      deletedStockMovementIds: updatedDeletedStockMovementIds,
      supplierSettlements: updatedSettlements,
      supplierReturnVouchers: updatedReturnVouchers,
      deletedSupplierReturnIds: updatedDeletedReturnIds,
      eventSchedules: updatedSchedules,
      deletedEventScheduleIds: updatedDeletedEventIds,
      eventBranches: updatedBranches,
      boothTransfers: updatedBoothTransfers,
      deletedBoothTransferIds: updatedDeletedBoothTransferIds,
      staffUsers: updatedStaffUsers,
      settings: updatedSettings,
      customOptions: updatedOptions,
    };

    cachedBundle = updatedBundle;
    lastCacheFetchTime = Date.now();

    // 4. Save consolidated bundle to D1 & KV
    await saveBundleToD1AndKV(env, updatedBundle);

    return new Response(
      JSON.stringify({
        success: true,
        version: newVersion,
        serverTimeUTC: new Date().toISOString(),
      }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 400, headers: corsHeaders }
    );
  }
}
