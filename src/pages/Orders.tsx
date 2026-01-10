import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_address: {
    first_name?: string;
    last_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  } | null;
  created_at: string;
  items: OrderItem[];
}

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  processing: { label: 'Processing', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-primary', bg: 'bg-primary/10' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setLoading(false);
        return;
      }

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return {
            ...order,
            items: itemsData || [],
          };
        })
      );

      setOrders(ordersWithItems as unknown as Order[]);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-2xl text-foreground">
              lunia<span className="text-primary text-xs align-top">™</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Back link */}
        <Link 
          to="/profile"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>

        <h1 className="font-display text-4xl text-foreground mb-8">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-secondary/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = getStatusConfig(order.status);
              const StatusIcon = status.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-secondary/30 rounded-2xl border border-border overflow-hidden"
                >
                  {/* Order Header */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full p-6 flex flex-col sm:flex-row sm:items-center gap-4 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-foreground">{order.order_number}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-medium text-foreground">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{order.items.length} item(s)</p>
                      </div>
                      <div className={`w-8 h-8 rounded-full bg-secondary flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <ArrowLeft className="w-4 h-4 text-muted-foreground -rotate-90" />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-border">
                      {/* Order Items */}
                      <div className="py-4 space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            {item.product_image && (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-14 h-14 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{item.product_name}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-foreground">${item.total_price.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Order Details */}
                      <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Shipping Address</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.shipping_address?.first_name} {order.shipping_address?.last_name}<br />
                            {order.shipping_address?.address}<br />
                            {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip_code}<br />
                            {order.shipping_address?.country}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Order Summary</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span className="text-foreground">${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shipping</span>
                              <span className="text-foreground">{order.shipping_cost === 0 ? 'Free' : `$${order.shipping_cost.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tax</span>
                              <span className="text-foreground">${order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium pt-2 border-t border-border">
                              <span className="text-foreground">Total</span>
                              <span className="text-primary">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          💵 {order.payment_method === 'pay_on_delivery' ? 'Pay on Delivery' : order.payment_method} • {order.payment_status === 'pending' ? 'Payment Pending' : 'Paid'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
