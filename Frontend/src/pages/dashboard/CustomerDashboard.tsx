import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  FileText, 
  Clock, 
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useRentalStore } from '@/stores/rentalStore';

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const { orders } = useRentalStore();

  const userOrders = orders.filter((o) => o.customerId === user?.id);
  const activeRentals = userOrders.filter((o) => o.status === 'picked_up');
  const pendingOrders = userOrders.filter((o) => o.status === 'pending');

  const stats = [
    {
      title: 'Total Orders',
      value: userOrders.length,
      icon: ShoppingCart,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Rentals',
      value: activeRentals.length,
      icon: Package,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Pending',
      value: pendingOrders.length,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Invoices',
      value: userOrders.length,
      icon: FileText,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
  ];

  const recentOrders = userOrders.slice(0, 5);

  return (
    <MainLayout>
      <div className="container px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">
            Manage your rentals and orders from your dashboard
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="rounded-2xl">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Recent Orders */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button asChild variant="outline" className="justify-start rounded-xl">
                  <Link to="/products">
                    <Package className="mr-2 h-4 w-4" />
                    Browse Products
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start rounded-xl">
                  <Link to="/orders">
                    <FileText className="mr-2 h-4 w-4" />
                    View All Orders
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start rounded-xl">
                  <Link to="/cart">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View Cart
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/orders">
                    View All
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-xl border border-border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Order #{order.id.slice(-6)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              order.status === 'completed'
                                ? 'default'
                                : order.status === 'picked_up'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="rounded-lg capitalize"
                          >
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <p className="mt-1 text-sm font-medium">
                            ₹{order.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No orders yet</p>
                    <Button asChild className="mt-4 rounded-xl" size="sm">
                      <Link to="/products">Start Renting</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
