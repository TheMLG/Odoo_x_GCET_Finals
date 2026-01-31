import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Settings,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRentalStore } from '@/stores/rentalStore';
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

export default function AdminDashboard() {
  const { products, orders } = useRentalStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.paidAmount, 0);
  const activeProducts = products.filter((p) => p.isPublished).length;
  const totalOrders = orders.length;
  const activeRentals = orders.filter((o) => o.status === 'picked_up').length;

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      subtitle: 'Total earnings',
      change: '+15%',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      subtitle: 'All time orders',
      change: '+12%',
    },
    {
      title: 'Active Products',
      value: activeProducts,
      icon: Package,
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      subtitle: 'Published products',
      change: '+5',
    },
    {
      title: 'Active Rentals',
      value: activeRentals,
      icon: Users,
      textColor: 'text-red-700',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      subtitle: 'Currently rented',
      change: null,
    },
  ];

  return (
    <MainLayout showFooter={false}>
      <div className="container px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System overview and management
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
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
    </MainLayout>
  );
}
