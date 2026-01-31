import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  ShoppingCart,
  TrendingUp,
  Settings,
  BarChart3,
  ArrowUpRight,
  IndianRupee
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const ordersByMonth = [
  { month: 'Jan', orders: 45 },
  { month: 'Feb', orders: 52 },
  { month: 'Mar', orders: 48 },
  { month: 'Apr', orders: 61 },
  { month: 'May', orders: 55 },
  { month: 'Jun', orders: 67 },
];

const categoryData = [
  { name: 'Photography', value: 35, color: 'hsl(221, 83%, 53%)' },
  { name: 'Audio', value: 25, color: 'hsl(142, 76%, 36%)' },
  { name: 'Computers', value: 20, color: 'hsl(38, 92%, 50%)' },
  { name: 'Electronics', value: 15, color: 'hsl(280, 65%, 60%)' },
  { name: 'Other', value: 5, color: 'hsl(215, 16%, 47%)' },
];

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch dashboard stats',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="text-center">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="text-center text-red-500">Failed to load dashboard data</div>
        </div>
      </AdminLayout>
    );
  }

  const totalRevenue = stats.recentOrders?.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0) || 0;
  const activeProducts = stats.totalProducts;
  const totalOrders = stats.totalOrders;
  const activeRentals = stats.recentOrders?.filter((o: any) => o.status === 'PICKED_UP').length || 0;

  const statCards = [
    {
      title: 'Total Revenue',
      value: (
        <div className="flex items-center gap-1">
          <IndianRupee className="h-7 w-7" />
          {totalRevenue.toLocaleString()}
        </div>
      ),
      icon: IndianRupee,
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      subtitle: 'Total earnings',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      subtitle: 'All time orders',
    },
    {
      title: 'Active Products',
      value: activeProducts,
      icon: Package,
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      subtitle: 'Published products',
    },
    {
      title: 'Active Rentals',
      value: activeRentals,
      icon: Users,
      textColor: 'text-red-700',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      subtitle: 'Currently rented',
    },
  ];

  return (
    <AdminLayout>
      <div className="container px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`rounded-3xl border-0 shadow-sm ${stat.bgColor}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <p className={`text-sm font-semibold uppercase tracking-wide ${stat.textColor}`}>
                      {stat.title}
                    </p>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    <p className={`text-sm ${stat.textColor} opacity-70`}>{stat.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Orders Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Orders Overview</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/reports">
                    <BarChart3 className="mr-1 h-4 w-4" />
                    Full Report
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar
                        dataKey="orders"
                        fill="hsl(221, 83%, 53%)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">By Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.name}</span>
                      </div>
                      <span className="font-medium">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button asChild variant="outline" className="justify-start rounded-xl">
                  <Link to="/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                    <ArrowUpRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start rounded-xl">
                  <Link to="/admin/products">
                    <Package className="mr-2 h-4 w-4" />
                    All Products
                    <ArrowUpRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start rounded-xl">
                  <Link to="/admin/orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    All Orders
                    <ArrowUpRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start rounded-xl">
                  <Link to="/admin/reports">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Reports
                    <ArrowUpRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
