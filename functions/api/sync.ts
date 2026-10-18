// Cloudflare Pages Function for Realtime Multi-Device Sync (/api/sync)
let memorySyncData: any = {
  version: Date.now(),
  products: null,
  deletedIds: null,
  orders: null,
  deletedOrderIds: null,
  stockMovements: null,
  supplierSettlements: null,
  eventSchedules: null,
  eventBranches: null,
  settings: null,
  customOptions: null,
};

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

async function getKVData(env: any, key: string, fallback: any) {
  if (env?.HUDA_KV) {
    try {
      const raw = await env.HUDA_KV.get(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
  }
  return fallback;
}

async function putKVData(env: any, key: string, val: any) {
  if (env?.HUDA_KV) {
    try {
      await env.HUDA_KV.put(key, JSON.stringify(val));
    } catch (e) {}
  }
}

export async function onRequestGet(context: any) {
  try {
    const url = new URL(context.request.url);
    const clientVersion = parseInt(url.searchParams.get('v') || '0', 10);

    const env = context.env;
    let serverVersion = memorySyncData.version;

    if (env?.HUDA_KV) {
      try {
        const rawVer = await env.HUDA_KV.get('huda_sync_version');
        if (rawVer) {
          const parsedVer = parseInt(rawVer, 10);
          if (parsedVer > 0) serverVersion = parsedVer;
        }
      } catch (e) {}
    }

    // If client is already up-to-date and server version matches
    if (clientVersion > 0 && clientVersion >= serverVersion) {
      return new Response(
        JSON.stringify({
          success: true,
          upToDate: true,
          version: serverVersion,
          serverTimeUTC: new Date().toISOString(),
        }),
        { headers: corsHeaders }
      );
    }

    // Fetch all entities from KV or memory cache
    const [
      products,
      deletedIds,
      orders,
      deletedOrderIds,
      stockMovements,
      supplierSettlements,
      eventSchedules,
      eventBranches,
      settings,
      customOptions,
    ] = await Promise.all([
      getKVData(env, 'huda_products', memorySyncData.products || []),
      getKVData(env, 'huda_deleted_ids', memorySyncData.deletedIds || []),
      getKVData(env, 'huda_orders', memorySyncData.orders || []),
      getKVData(env, 'huda_deleted_order_ids', memorySyncData.deletedOrderIds || []),
      getKVData(env, 'huda_stock_movements', memorySyncData.stockMovements || []),
      getKVData(env, 'huda_supplier_settlements', memorySyncData.supplierSettlements || []),
      getKVData(env, 'huda_event_schedules', memorySyncData.eventSchedules || []),
      getKVData(env, 'huda_event_branches', memorySyncData.eventBranches || []),
      getKVData(env, 'huda_settings', memorySyncData.settings || null),
      getKVData(env, 'huda_custom_options', memorySyncData.customOptions || null),
    ]);

    memorySyncData = {
      version: serverVersion,
      products,
      deletedIds,
      orders,
      deletedOrderIds,
      stockMovements,
      supplierSettlements,
      eventSchedules,
      eventBranches,
      settings,
      customOptions,
    };

    return new Response(
      JSON.stringify({
        success: true,
        upToDate: false,
        version: serverVersion,
        products: products || [],
        deletedIds: deletedIds || [],
        orders: orders || [],
        deletedOrderIds: deletedOrderIds || [],
        stockMovements: stockMovements || [],
        supplierSettlements: supplierSettlements || [],
        eventSchedules: eventSchedules || [],
        eventBranches: eventBranches || [],
        settings: settings || null,
        customOptions: customOptions || null,
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

    // 1. Fetch current data
    const [
      curProducts,
      curDeletedIds,
      curOrders,
      curDeletedOrderIds,
      curMovements,
      curSettlements,
      curSchedules,
      curBranches,
      curSettings,
      curOptions,
    ] = await Promise.all([
      getKVData(env, 'huda_products', memorySyncData.products || []),
      getKVData(env, 'huda_deleted_ids', memorySyncData.deletedIds || []),
      getKVData(env, 'huda_orders', memorySyncData.orders || []),
      getKVData(env, 'huda_deleted_order_ids', memorySyncData.deletedOrderIds || []),
      getKVData(env, 'huda_stock_movements', memorySyncData.stockMovements || []),
      getKVData(env, 'huda_supplier_settlements', memorySyncData.supplierSettlements || []),
      getKVData(env, 'huda_event_schedules', memorySyncData.eventSchedules || []),
      getKVData(env, 'huda_event_branches', memorySyncData.eventBranches || []),
      getKVData(env, 'huda_settings', memorySyncData.settings || null),
      getKVData(env, 'huda_custom_options', memorySyncData.customOptions || null),
    ]);

    // 2. Merge or Replace incoming updates
    let updatedProducts = curProducts || [];
    let updatedDeletedIds = curDeletedIds || [];
    let updatedOrders = curOrders || [];
    let updatedDeletedOrderIds = curDeletedOrderIds || [];
    let updatedMovements = curMovements || [];
    let updatedSettlements = curSettlements || [];
    let updatedSchedules = curSchedules || [];
    let updatedBranches = curBranches || [];
    let updatedSettings = curSettings;
    let updatedOptions = curOptions || {};

    if (body.replace_all) {
      if (Array.isArray(body.products)) updatedProducts = body.products;
      if (Array.isArray(body.deletedIds)) updatedDeletedIds = body.deletedIds;
      if (Array.isArray(body.orders)) updatedOrders = body.orders;
      if (Array.isArray(body.deletedOrderIds)) updatedDeletedOrderIds = body.deletedOrderIds;
      if (Array.isArray(body.stockMovements)) updatedMovements = body.stockMovements;
      if (Array.isArray(body.supplierSettlements)) updatedSettlements = body.supplierSettlements;
      if (Array.isArray(body.eventSchedules)) updatedSchedules = body.eventSchedules;
      if (Array.isArray(body.eventBranches)) updatedBranches = body.eventBranches;
      if (body.settings && typeof body.settings === 'object') updatedSettings = body.settings;
      if (body.customOptions && typeof body.customOptions === 'object') updatedOptions = body.customOptions;
    } else {
      if (Array.isArray(body.deletedIds)) {
        updatedDeletedIds = Array.from(new Set([...updatedDeletedIds, ...body.deletedIds]));
      }

      if (Array.isArray(body.products)) {
        const prodMap = new Map<string, any>();
        (curProducts || []).forEach((p: any) => prodMap.set(p.id, p));
        body.products.forEach((p: any) => {
          if (!updatedDeletedIds.includes(p.id)) {
            prodMap.set(p.id, p);
          }
        });
        updatedProducts = Array.from(prodMap.values()).filter((p: any) => !updatedDeletedIds.includes(p.id));
      }

      // Merge Orders
      if (Array.isArray(body.deletedOrderIds)) {
        updatedDeletedOrderIds = Array.from(new Set([...updatedDeletedOrderIds, ...body.deletedOrderIds]));
      }

      if (Array.isArray(body.orders)) {
        const orderMap = new Map<string, any>();
        (curOrders || []).forEach((o: any) => orderMap.set(o.id, o));
        body.orders.forEach((o: any) => {
          if (!updatedDeletedOrderIds.includes(o.id)) {
            const existing = orderMap.get(o.id);
            if (!existing) {
              orderMap.set(o.id, o);
            } else {
              // Keep the one with more recent updatedAt or updated payment/status
              const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
              const incomingTime = new Date(o.updatedAt || o.createdAt || 0).getTime();
              orderMap.set(o.id, incomingTime >= existingTime ? o : existing);
            }
          }
        });
        updatedOrders = Array.from(orderMap.values())
          .filter((o: any) => !updatedDeletedOrderIds.includes(o.id))
          .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      }

      // Merge Stock Movements
      if (Array.isArray(body.stockMovements)) {
        const movMap = new Map<string, any>();
        (curMovements || []).forEach((m: any) => movMap.set(m.id, m));
        body.stockMovements.forEach((m: any) => movMap.set(m.id, m));
        updatedMovements = Array.from(movMap.values()).sort(
          (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      }

      // Merge Supplier Settlements
      if (Array.isArray(body.supplierSettlements)) {
        const setMap = new Map<string, any>();
        (curSettlements || []).forEach((s: any) => setMap.set(s.id, s));
        body.supplierSettlements.forEach((s: any) => setMap.set(s.id, s));
        updatedSettlements = Array.from(setMap.values()).sort(
          (a: any, b: any) => new Date(b.settledAt || 0).getTime() - new Date(a.settledAt || 0).getTime()
        );
      }

      // Merge Event Schedules
      if (Array.isArray(body.eventSchedules)) {
        const schMap = new Map<string, any>();
        (curSchedules || []).forEach((s: any) => schMap.set(s.id, s));
        body.eventSchedules.forEach((s: any) => schMap.set(s.id, s));
        updatedSchedules = Array.from(schMap.values()).sort(
          (a: any, b: any) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime()
        );
      }

      // Merge Event Branches
      if (Array.isArray(body.eventBranches)) {
        updatedBranches = Array.from(new Set([...(curBranches || []), ...body.eventBranches]));
      }

      // Merge Settings
      if (body.settings && typeof body.settings === 'object') {
        updatedSettings = { ...(curSettings || {}), ...body.settings };
      }

      // Merge Custom Options
      if (body.customOptions && typeof body.customOptions === 'object') {
        updatedOptions = {
          suppliers: Array.from(new Set([...(curOptions?.suppliers || []), ...(body.customOptions.suppliers || [])])),
          stockInNotes: Array.from(new Set([...(curOptions?.stockInNotes || []), ...(body.customOptions.stockInNotes || [])])),
          categories: body.customOptions.categories || curOptions?.categories || [],
          fabrics: { ...(curOptions?.fabrics || {}), ...(body.customOptions.fabrics || {}) },
          sizes: { ...(curOptions?.sizes || {}), ...(body.customOptions.sizes || {}) },
          colors: { ...(curOptions?.colors || {}), ...(body.customOptions.colors || {}) },
          descriptions: Array.from(new Set([...(curOptions?.descriptions || []), ...(body.customOptions.descriptions || [])])),
        };
      }
    }

    // 3. Save to KV and update in-memory cache
    memorySyncData = {
      version: newVersion,
      products: updatedProducts,
      deletedIds: updatedDeletedIds,
      orders: updatedOrders,
      deletedOrderIds: updatedDeletedOrderIds,
      stockMovements: updatedMovements,
      supplierSettlements: updatedSettlements,
      eventSchedules: updatedSchedules,
      eventBranches: updatedBranches,
      settings: updatedSettings,
      customOptions: updatedOptions,
    };

    if (env?.HUDA_KV) {
      await Promise.all([
        putKVData(env, 'huda_sync_version', newVersion.toString()),
        body.products ? putKVData(env, 'huda_products', updatedProducts) : Promise.resolve(),
        body.deletedIds ? putKVData(env, 'huda_deleted_ids', updatedDeletedIds) : Promise.resolve(),
        body.orders ? putKVData(env, 'huda_orders', updatedOrders) : Promise.resolve(),
        body.deletedOrderIds ? putKVData(env, 'huda_deleted_order_ids', updatedDeletedOrderIds) : Promise.resolve(),
        body.stockMovements ? putKVData(env, 'huda_stock_movements', updatedMovements) : Promise.resolve(),
        body.supplierSettlements ? putKVData(env, 'huda_supplier_settlements', updatedSettlements) : Promise.resolve(),
        body.eventSchedules ? putKVData(env, 'huda_event_schedules', updatedSchedules) : Promise.resolve(),
        body.eventBranches ? putKVData(env, 'huda_event_branches', updatedBranches) : Promise.resolve(),
        body.settings ? putKVData(env, 'huda_settings', updatedSettings) : Promise.resolve(),
        body.customOptions ? putKVData(env, 'huda_custom_options', updatedOptions) : Promise.resolve(),
      ]);
    }

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
