import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, DollarSign, 
  TrendingUp, ArrowUpRight, ArrowDownRight, Leaf, Settings,
  BarChart3, Star, AlertCircle, CheckCircle, Clock, XCircle,
  ChevronRight, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/use-user-roles';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  averageOrderValue: number;
  aovChange: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  shipping_address: any;
}

interface TopProduct {
  product_name: string;
  total_sold: number;
  revenue: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isModerator, loading: rolesLoading } = useUserRoles();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (!rolesLoading && !isAdmin && !isModerator) {
      navigate('/');
    }
  }, [isAdmin, isModerator, rolesLoading, navigate]);

  useEffect(() => {
    if (isAdmin || isModerator) {
      fetchDashboardData();
    }
  }, [isAdmin, isModerator, dateRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const currentStart = startOfDay(subDays(new Date(), days));
      const previousStart = startOfDay(subDays(currentStart, days));
      const currentEnd = endOfDay(new Date());

      // Fetch current period orders
      const { data: currentOrders } = await supabase
        .from('orders')
        .select('id, total, created_at, user_id')
        .gte('created_at', currentStart.toISOString())
        .lte('created_at', currentEnd.toISOString())
        .eq('payment_status', 'paid');

      // Fetch previous period orders for comparison
      const { data: previousOrders } = await supabase
        .from('orders')
        .select('id, total')
        .gte('created_at', previousStart.toISOString())
        .lt('created_at', currentStart.toISOString())
        .eq('payment_status', 'paid');

      // Calculate stats
      const currentRevenue = currentOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const previousRevenue = previousOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const revenueChange = previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      const currentOrderCount = currentOrders?.length || 0;
      const previousOrderCount = previousOrders?.length || 0;
      const ordersChange = previousOrderCount ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0;

      const uniqueCustomers = new Set(currentOrders?.map(o => o.user_id)).size;
      const previousUniqueCustomers = new Set(previousOrders?.map((o: any) => o.user_id)).size;
      const customersChange = previousUniqueCustomers ? ((uniqueCustomers - previousUniqueCustomers) / previousUniqueCustomers) * 100 : 0;

      const currentAOV = currentOrderCount ? currentRevenue / currentOrderCount : 0;
      const previousAOV = previousOrderCount ? previousRevenue / previousOrderCount : 0;
      const aovChange = previousAOV ? ((currentAOV - previousAOV) / previousAOV) * 100 : 0;

      setStats({
        totalRevenue: currentRevenue,
        revenueChange,
        totalOrders: currentOrderCount,
        ordersChange,
        totalCustomers: uniqueCustomers,
        customersChange,
        averageOrderValue: currentAOV,
        aovChange,
      });

      // Fetch recent orders
      const { data: recent } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at, shipping_address')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentOrders(recent || []);

      // Fetch top products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_name, quantity, total_price');

      const productMap = new Map<string, { total_sold: number; revenue: number }>();
      orderItems?.forEach(item => {
        const existing = productMap.get(item.product_name) || { total_sold: 0, revenue: 0 };
        productMap.set(item.product_name, {
          total_sold: existing.total_sold + item.quantity,
          revenue: existing.revenue + item.total_price,
        });
      });

      const topProductsList = Array.from(productMap.entries())
        .map(([product_name, data]) => ({ product_name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopProducts(topProductsList);

      // Fetch low stock products
      const { data: lowStock } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .eq('is_active', true)
        .lt('stock_quantity', 10)
        .order('stock_quantity', { ascending: true })
        .limit(5);

      setLowStockProducts(lowStock || []);

      // Fetch pending reviews count
      const { count } = await supabase
        .from('product_reviews')
        .select('id', { count: 'exact', head: true })
        .eq('moderation_status', 'pending');

      setPendingReviews(count || 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'shipped': return <Package className="w-4 h-4 text-blue-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (rolesLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin && !isModerator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display text-2xl text-foreground">
                lunia<span className="text-primary text-xs align-top">™</span>
              </span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="font-display text-xl text-foreground flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={fetchDashboardData}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Revenue', value: `$${stats?.totalRevenue.toFixed(2) || '0'}`, change: stats?.revenueChange || 0, icon: DollarSign },
            { label: 'Total Orders', value: stats?.totalOrders || 0, change: stats?.ordersChange || 0, icon: ShoppingCart },
            { label: 'Customers', value: stats?.totalCustomers || 0, change: stats?.customersChange || 0, icon: Users },
            { label: 'Avg Order Value', value: `$${stats?.averageOrderValue.toFixed(2) || '0'}`, change: stats?.aovChange || 0, icon: TrendingUp },
          ].map((stat, i) => (
            <div key={i} className="bg-secondary/30 border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(stat.change).toFixed(1)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Reviews', count: pendingReviews, href: '/admin/reviews', color: 'bg-amber-500' },
            { label: 'Low Stock Items', count: lowStockProducts.length, href: '#low-stock', color: 'bg-red-500' },
            { label: 'View All Orders', count: null, href: '/orders', color: 'bg-blue-500' },
            { label: 'Settings', count: null, href: '#', color: 'bg-muted' },
          ].map((action, i) => (
            <Link
              key={i}
              to={action.href}
              className="flex items-center justify-between p-4 bg-secondary/30 border border-border rounded-xl hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${action.color}`} />
                <span className="text-foreground font-medium">{action.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {action.count !== null && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
                    {action.count}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-secondary/30 border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-foreground">Recent Orders</h2>
              <Link to="/orders" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/order-tracking/${order.id}`}
                  className="flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-medium text-foreground">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </Link>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No orders yet</p>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-secondary/30 border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-foreground">Top Products</h2>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div
                  key={product.product_name}
                  className="flex items-center justify-between p-4 bg-background border border-border rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{product.product_name}</p>
                      <p className="text-sm text-muted-foreground">{product.total_sold} sold</p>
                    </div>
                  </div>
                  <p className="font-medium text-foreground">${product.revenue.toFixed(2)}</p>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No sales data yet</p>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div id="low-stock" className="bg-secondary/30 border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Low Stock Alert
              </h2>
            </div>
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-background border border-amber-500/30 rounded-xl"
                >
                  <p className="font-medium text-foreground">{product.name}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock_quantity <= 5 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {product.stock_quantity} left
                  </span>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">All products well-stocked!</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-secondary/30 border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl text-foreground mb-6">Performance Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Conversion Rate</span>
                <span className="font-medium text-foreground">3.2%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="w-[32%] h-full bg-primary rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cart Abandonment</span>
                <span className="font-medium text-foreground">68%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="w-[68%] h-full bg-amber-500 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Customer Satisfaction</span>
                <span className="font-medium text-foreground flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  4.8
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="w-[96%] h-full bg-green-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
