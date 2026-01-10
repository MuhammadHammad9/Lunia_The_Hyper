import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Leaf, ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface TrackingEvent {
  id: string;
  order_id: string;
  status: string;
  title: string;
  description: string | null;
  location: string | null;
  created_at: string;
}

interface OrderInfo {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  shipping_address: {
    first_name?: string;
    last_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  } | null;
}

const statusIcons: Record<string, typeof Package> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusColors: Record<string, string> = {
  pending: 'text-amber-500 bg-amber-500',
  processing: 'text-blue-500 bg-blue-500',
  shipped: 'text-primary bg-primary',
  delivered: 'text-green-500 bg-green-500',
  cancelled: 'text-destructive bg-destructive',
};

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderTracking = async () => {
      if (!orderId) return;

      try {
        // Fetch order info
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('id, order_number, status, created_at, shipping_address')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData as unknown as OrderInfo);

        // Fetch tracking events
        const { data: eventsData, error: eventsError } = await supabase
          .from('order_tracking_events')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false });

        if (eventsError) throw eventsError;
        setEvents(eventsData || []);
      } catch (error) {
        console.error('Error fetching order tracking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderTracking();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-foreground mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find the order you're looking for.</p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[order.status] || Clock;
  const statusColor = statusColors[order.status] || 'text-muted-foreground bg-muted-foreground';

  // Progress steps
  const progressSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = progressSteps.indexOf(order.status);

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

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Back link */}
        <Link 
          to="/orders"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>

        {/* Order Header */}
        <div className="bg-secondary/30 rounded-2xl border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-mono text-lg font-medium text-foreground">{order.order_number}</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusColor.replace('text-', 'bg-').replace('bg-', 'bg-')}/10`}>
              <StatusIcon className={`w-5 h-5 ${statusColor.split(' ')[0]}`} />
              <span className={`font-medium capitalize ${statusColor.split(' ')[0]}`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {order.status !== 'cancelled' && (
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                {progressSteps.map((step, index) => {
                  const StepIcon = statusIcons[step];
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs mt-2 capitalize ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="relative h-1 bg-secondary rounded-full mt-4">
                <div
                  className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (progressSteps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Shipping to</p>
                  <p className="text-sm text-muted-foreground">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
                    {order.shipping_address.address}<br />
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Timeline */}
        <div>
          <h2 className="font-display text-2xl text-foreground mb-6">Tracking History</h2>
          
          {events.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-xl">
              <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No tracking events yet</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {events.map((event, index) => {
                  const EventIcon = statusIcons[event.status] || Clock;
                  const eventColor = statusColors[event.status] || 'text-muted-foreground bg-muted-foreground';

                  return (
                    <div key={event.id} className="relative flex gap-4">
                      {/* Icon */}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                          index === 0
                            ? `${eventColor.split(' ')[1]} text-white`
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <EventIcon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-medium text-foreground">{event.title}</h4>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              )}
                              {event.location && (
                                <p className="text-sm text-primary mt-2 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(event.created_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderTracking;
