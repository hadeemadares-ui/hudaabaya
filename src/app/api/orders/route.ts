import { NextResponse } from 'next/server';
import { Order, AuditLog } from '../../../types';
import { INITIAL_ORDERS } from '../../../data/mockProducts';


// Central Database Store for Orders & Audit Logs
let globalOrders: Order[] = [...INITIAL_ORDERS];
let globalAuditLogs: AuditLog[] = [];

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

const createAuditLog = (action: AuditLog['action'], target: AuditLog['target'], description: string, performedBy: string = 'Admin'): AuditLog => {
  const log: AuditLog = {
    id: `LOG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    action,
    target,
    description,
    performedBy,
    timestamp: new Date().toISOString(),
  };
  globalAuditLogs = [log, ...globalAuditLogs.slice(0, 99)]; // Keep latest 100 logs
  return log;
};

export async function GET() {
  return NextResponse.json(
    { success: true, orders: globalOrders, auditLogs: globalAuditLogs },
    { headers: noCacheHeaders }
  );
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    const nowIso = new Date().toISOString();

    if (orderData.action === 'sync_all_orders') {
      if (Array.isArray(orderData.orders)) {
        globalOrders = orderData.orders;
      }
      return NextResponse.json({ success: true, orders: globalOrders }, { headers: noCacheHeaders });
    }

    if (orderData.action === 'update_status') {
      const { orderId, orderStatus, trackingNumber, courier, performedBy } = orderData;
      globalOrders = globalOrders.map((o) =>
        o.id === orderId
          ? { ...o, orderStatus, trackingNumber: trackingNumber || o.trackingNumber, courier: courier || o.courier, updatedAt: nowIso }
          : o
      );
      createAuditLog('UPDATE', 'ORDER', `Updated order #${orderId} status to ${orderStatus}`, performedBy);
      return NextResponse.json({ success: true, orders: globalOrders }, { headers: noCacheHeaders });
    }

    if (orderData.action === 'update_payment') {
      const { orderId, paymentStatus, performedBy } = orderData;
      globalOrders = globalOrders.map((o) => (o.id === orderId ? { ...o, paymentStatus, updatedAt: nowIso } : o));
      createAuditLog('UPDATE', 'ORDER', `Updated order #${orderId} payment status to ${paymentStatus}`, performedBy);
      return NextResponse.json({ success: true, orders: globalOrders }, { headers: noCacheHeaders });
    }

    if (orderData.action === 'delete_order') {
      const { orderId, performedBy } = orderData;
      globalOrders = globalOrders.filter((o) => o.id !== orderId);
      createAuditLog('DELETE', 'ORDER', `Deleted order #${orderId}`, performedBy);
      return NextResponse.json({ success: true, orders: globalOrders }, { headers: noCacheHeaders });
    }

    // Safe Sample Reset: Clears ONLY sample/test orders without touching real live orders
    if (orderData.action === 'clear_sample_orders' || orderData.action === 'clear_all_orders') {
      const prevCount = globalOrders.length;
      if (orderData.action === 'clear_sample_orders') {
        globalOrders = globalOrders.filter((o) => !o.isSample);
      } else {
        globalOrders = [];
      }
      const removedCount = prevCount - globalOrders.length;
      createAuditLog('RESET_SAMPLES', 'ORDER', `Reset ${removedCount} sample test orders to 0. Remaining live orders: ${globalOrders.length}`, orderData.performedBy || 'Admin');
      return NextResponse.json({ success: true, orders: globalOrders, removedCount }, { headers: noCacheHeaders });
    }

    // New Order creation (Standardized UTC Server Timestamp)
    const newOrder: Order = {
      ...orderData,
      id: orderData.id || `HAD-${nowIso.slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: orderData.createdAt || nowIso,
      updatedAt: nowIso,
      isSample: orderData.isSample || false,
    };

    globalOrders = [newOrder, ...globalOrders];
    createAuditLog('CREATE', 'ORDER', `Created order #${newOrder.id} (${newOrder.items.length} items, Total: ฿${newOrder.netAmount})`, newOrder.customerName || 'Customer');

    return NextResponse.json({ success: true, order: newOrder, orders: globalOrders }, { headers: noCacheHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to process order' }, { status: 400, headers: noCacheHeaders });
  }
}
