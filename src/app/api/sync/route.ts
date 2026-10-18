import { NextResponse } from 'next/server';

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

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientVersion = parseInt(url.searchParams.get('v') || '0', 10);

  if (clientVersion > 0 && clientVersion >= memorySyncData.version) {
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
    supplierSettlements: memorySyncData.supplierSettlements || [],
    eventSchedules: memorySyncData.eventSchedules || [],
    eventBranches: memorySyncData.eventBranches || [],
    settings: memorySyncData.settings || null,
    customOptions: memorySyncData.customOptions || null,
    serverTimeUTC: new Date().toISOString(),
  }, { headers: noCacheHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newVersion = Date.now();

    if (Array.isArray(body.products)) memorySyncData.products = body.products;
    if (Array.isArray(body.deletedIds)) memorySyncData.deletedIds = body.deletedIds;
    if (Array.isArray(body.orders)) memorySyncData.orders = body.orders;
    if (Array.isArray(body.deletedOrderIds)) memorySyncData.deletedOrderIds = body.deletedOrderIds;
    if (Array.isArray(body.stockMovements)) memorySyncData.stockMovements = body.stockMovements;
    if (Array.isArray(body.supplierSettlements)) memorySyncData.supplierSettlements = body.supplierSettlements;
    if (Array.isArray(body.eventSchedules)) memorySyncData.eventSchedules = body.eventSchedules;
    if (Array.isArray(body.eventBranches)) memorySyncData.eventBranches = body.eventBranches;
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
