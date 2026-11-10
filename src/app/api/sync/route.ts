import { NextResponse } from 'next/server';

let memorySyncData: any = {
  version: Date.now(),
  products: null,
  deletedIds: null,
  orders: null,
  deletedOrderIds: null,
  stockMovements: null,
  deletedStockMovementIds: null,
  supplierSettlements: null,
  eventSchedules: null,
  deletedEventScheduleIds: null,
  eventBranches: null,
  boothTransfers: null,
  deletedBoothTransferIds: null,
  staffUsers: null,
  settings: null,
  customOptions: null,
};

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request: Request) {
  const url = new URL(request.url);

  // 1. Forward directly to Cloudflare Production API for live cross-device sync
  try {
    const cloudRes = await fetch(`https://hudaabaya.pages.dev/api/sync?${url.searchParams.toString()}`, {
      headers: { 'Cache-Control': 'no-cache' },
      cache: 'no-store',
    });
    if (cloudRes.ok) {
      const data = await cloudRes.json();
      return NextResponse.json(data, { headers: noCacheHeaders });
    }
  } catch (err) {}

  const clientVersion = parseInt(url.searchParams.get('v') || '0', 10);
  const isForced = url.searchParams.get('force') === '1' || url.searchParams.get('force') === 'true' || clientVersion === 0;

  if (!isForced && clientVersion > 0 && memorySyncData.version > 0 && clientVersion >= memorySyncData.version) {
    return NextResponse.json({
      success: true,
      upToDate: true,
      version: memorySyncData.version,
      serverTimeUTC: new Date().toISOString(),
    }, { headers: noCacheHeaders });
  }

  return NextResponse.json({
    success: true,
    upToDate: false,
    version: memorySyncData.version,
    products: memorySyncData.products || [],
    deletedIds: memorySyncData.deletedIds || [],
    orders: memorySyncData.orders || [],
    deletedOrderIds: memorySyncData.deletedOrderIds || [],
    stockMovements: memorySyncData.stockMovements || [],
    deletedStockMovementIds: memorySyncData.deletedStockMovementIds || [],
    supplierSettlements: memorySyncData.supplierSettlements || [],
    eventSchedules: memorySyncData.eventSchedules || [],
    eventBranches: memorySyncData.eventBranches || [],
    boothTransfers: memorySyncData.boothTransfers || [],
    deletedBoothTransferIds: memorySyncData.deletedBoothTransferIds || [],
    staffUsers: memorySyncData.staffUsers || [],
    settings: memorySyncData.settings || null,
    customOptions: memorySyncData.customOptions || null,
    serverTimeUTC: new Date().toISOString(),
  }, { headers: noCacheHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Forward directly to Cloudflare Production API for live cross-device sync
    try {
      const cloudRes = await fetch('https://hudaabaya.pages.dev/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (cloudRes.ok) {
        const data = await cloudRes.json();
        return NextResponse.json(data, { headers: noCacheHeaders });
      }
    } catch (err) {}

    const newVersion = Date.now();

    if (Array.isArray(body.products)) memorySyncData.products = body.products;
    if (Array.isArray(body.deletedIds)) memorySyncData.deletedIds = body.deletedIds;
    if (Array.isArray(body.orders)) memorySyncData.orders = body.orders;
    if (Array.isArray(body.deletedOrderIds)) memorySyncData.deletedOrderIds = body.deletedOrderIds;
    if (Array.isArray(body.stockMovements)) memorySyncData.stockMovements = body.stockMovements;
    if (Array.isArray(body.deletedStockMovementIds)) memorySyncData.deletedStockMovementIds = body.deletedStockMovementIds;
    if (Array.isArray(body.supplierSettlements)) memorySyncData.supplierSettlements = body.supplierSettlements;
    if (Array.isArray(body.eventSchedules)) memorySyncData.eventSchedules = body.eventSchedules;
    if (Array.isArray(body.deletedEventScheduleIds)) memorySyncData.deletedEventScheduleIds = body.deletedEventScheduleIds;
    if (Array.isArray(body.eventBranches)) memorySyncData.eventBranches = body.eventBranches;
    if (Array.isArray(body.deletedBoothTransferIds)) {
      memorySyncData.deletedBoothTransferIds = Array.from(new Set([...(memorySyncData.deletedBoothTransferIds || []), ...body.deletedBoothTransferIds]));
    }
    if (Array.isArray(body.boothTransfers) && body.boothTransfers.length > 0) {
      const transferMap = new Map<string, any>();
      (memorySyncData.boothTransfers || []).forEach((t: any) => { if (t && t.id) transferMap.set(t.id, t); });
      body.boothTransfers.forEach((t: any) => { if (t && t.id) transferMap.set(t.id, t); });
      if (Array.isArray(body.deletedBoothTransferIds)) {
        body.deletedBoothTransferIds.forEach((delId: string) => transferMap.delete(delId));
      }
      memorySyncData.boothTransfers = Array.from(transferMap.values());
    } else if (Array.isArray(body.deletedBoothTransferIds)) {
      memorySyncData.boothTransfers = (memorySyncData.boothTransfers || []).filter((t: any) => !body.deletedBoothTransferIds.includes(t.id));
    }
    if (Array.isArray(body.staffUsers) && body.staffUsers.length > 0) {
      const staffMap = new Map<string, any>();
      (memorySyncData.staffUsers || []).forEach((u: any) => { if (u && u.id) staffMap.set(u.id, u); });
      body.staffUsers.forEach((u: any) => {
        if (u && u.id) {
          const existing = staffMap.get(u.id);
          if (!existing || (u.updatedAt || 0) >= (existing.updatedAt || 0)) {
            staffMap.set(u.id, u);
          }
        }
      });
      memorySyncData.staffUsers = Array.from(staffMap.values());
    }
    if (body.settings) memorySyncData.settings = { ...memorySyncData.settings, ...body.settings };
    if (body.customOptions) memorySyncData.customOptions = { ...memorySyncData.customOptions, ...body.customOptions };

    memorySyncData.version = newVersion;

    return NextResponse.json({
      success: true,
      version: newVersion,
      serverTimeUTC: new Date().toISOString(),
    }, { headers: noCacheHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
