<<<<<<< HEAD
import { VendorLayout } from "@/components/layout/VendorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVendorDashboardStats, VendorDashboardStats } from "@/lib/vendorApi";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  FileText,
  Loader2,
  Package,
  Plus,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
=======
```
import { motion } 'framer-motion';
import { Link } 'react-router-dom';
import {
  Package,
  ShoppingCart,
  FileText,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Settings
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useRentalStore } from '@/stores/rentalStore';
>>>>>>> 1d3deda463c98958ce34ccdd8ce71790ad9e5cd6
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function VendorDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VendorDashboardStats | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const dashboardStats = await getVendorDashboardStats();
        setStats(dashboardStats);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data",
        );
      } finally {
        setIsLoading(false);
      }
    };

<<<<<<< HEAD
    fetchDashboardData();
  }, []);

  const statCards =
    stats ?
      [
        {
          title: "Total Revenue",
          value: `₹${stats.totalRevenue.toLocaleString()}`,
          icon: DollarSign,
          textColor: "text-emerald-700",
          bgColor: "bg-emerald-100",
          iconColor: "text-emerald-600",
          subtitle: "Total earnings",
        },
        {
          title: "Total Orders",
          value: stats.totalOrders,
          icon: ShoppingCart,
          textColor: "text-blue-700",
          bgColor: "bg-blue-100",
          iconColor: "text-blue-600",
          subtitle: "All orders",
        },
        {
          title: "Active Rentals",
          value: stats.activeRentals,
          icon: Package,
          textColor: "text-purple-700",
          bgColor: "bg-purple-100",
          iconColor: "text-purple-600",
          subtitle: "Currently rented",
        },
        {
          title: "Overdue Returns",
          value: stats.overdueReturns,
          icon: AlertTriangle,
          textColor: "text-red-700",
          bgColor: "bg-red-100",
          iconColor: "text-red-600",
          subtitle: "Requires attention",
        },
      ]
    : [];

  if (isLoading) {
    return (
      <VendorLayout>
        <div className="container flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  if (error) {
    return (
      <VendorLayout>
        <div className="container flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">Failed to Load Dashboard</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </VendorLayout>
    );
  }
=======
  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${ totalRevenue.toLocaleString() } `,
      icon: IndianRupee,
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      subtitle: 'Total earnings',
      change: '+12%',
    },
    {
      title: 'Total Orders',
      value: vendorOrders.length,
      icon: ShoppingCart,
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      subtitle: 'All orders',
      change: '+8%',
    },
    {
      title: 'Active Rentals',
      value: activeRentals.length,
      icon: Package,
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      subtitle: 'Currently rented',
      change: null,
    },
    {
      title: 'Overdue Returns',
      value: overdueReturns.length,
      icon: AlertTriangle,
      textColor: 'text-red-700',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      subtitle: 'Requires attention',
      change: null,
    },
  ];
>>>>>>> 1d3deda463c98958ce34ccdd8ce71790ad9e5cd6

  return (
    <VendorLayout>
      <div className="container px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your products and track orders
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/vendor/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/vendor/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
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
<<<<<<< HEAD
              <Card
                className={`rounded-3xl border-0 shadow-sm ${stat.bgColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <p
                      className={`text-sm font-semibold uppercase tracking-wide ${stat.textColor}`}
                    >
=======
              <Card className={`rounded - 3xl border - 0 shadow - sm ${ stat.bgColor } `}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <p className={`text - sm font - semibold uppercase tracking - wide ${ stat.textColor } `}>
>>>>>>> 1d3deda463c98958ce34ccdd8ce71790ad9e5cd6
                      {stat.title}
                    </p>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                      <stat.icon className={`h - 5 w - 5 ${ stat.iconColor } `} />
                    </div>
                  </div>
                  <div className="space-y-0.5">
<<<<<<< HEAD
                    <p className={`text-4xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                    <p className={`text-sm ${stat.textColor} opacity-70`}>
                      {stat.subtitle}
                    </p>
=======
                    <p className={`text - 4xl font - bold ${ stat.textColor } `}>{stat.value}</p>
                    <p className={`text - sm ${ stat.textColor } opacity - 70`}>{stat.subtitle}</p>
>>>>>>> 1d3deda463c98958ce34ccdd8ce71790ad9e5cd6
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts & Tables */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.revenueByMonth || []}>
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(221, 83%, 53%)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(221, 83%, 53%)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
<<<<<<< HEAD
                        formatter={(value: number) => [
                          `₹${value.toLocaleString()}`,
                          "Revenue",
                        ]}
=======
                        formatter={(value: number) => [`₹${ value.toLocaleString() } `, 'Revenue']}
>>>>>>> 1d3deda463c98958ce34ccdd8ce71790ad9e5cd6
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(221, 83%, 53%)"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="justify-start rounded-xl"
                >
                  <Link to="/vendor/products">
                    <Package className="mr-2 h-4 w-4" />
                    Manage Products
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="justify-start rounded-xl"
                >
                  <Link to="/vendor/orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View Orders
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="justify-start rounded-xl"
                >
                  <Link to="/vendor/invoices">
                    <FileText className="mr-2 h-4 w-4" />
                    Invoices
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="mt-6 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Top Products</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/vendor/products">
                    View All
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topProducts && stats.topProducts.length > 0 ?
                    stats.topProducts.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{Number(product.pricePerDay).toLocaleString()}/day
                          </p>
                        </div>
                        <Badge variant="secondary" className="rounded-lg">
                          {product.quantityOnHand} left
                        </Badge>
                      </div>
                    ))
                  : <p className="text-sm text-muted-foreground text-center py-4">
                      No products yet. Add your first product!
                    </p>
                  }
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </VendorLayout>
  );
}
