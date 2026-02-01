import { ProductDialog } from "@/components/vendor/ProductDialog";
import { VendorLayout } from "@/components/layout/VendorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getVendorDashboardStats, VendorDashboardStats, getVendorOrders, VendorOrder } from "@/lib/vendorApi";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  FileText,
  Loader2,
  Package,
  Plus,
  Settings,
  ShoppingCartIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [recentOrders, setRecentOrders] = useState<VendorOrder[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Don't set loading to true here to avoid flickering on refresh
      setError(null);
      const [dashboardStats, orders] = await Promise.all([
        getVendorDashboardStats(),
        getVendorOrders()
      ]);
      setStats(dashboardStats);
      setRecentOrders(orders.slice(0, 5));
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      // Only set error if we don't have stats yet
      if (!stats) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    setIsLoading(true);
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
          icon: ShoppingCartIcon,
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
            <ProductDialog mode="add" onProductSaved={fetchDashboardData} />
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
              <Card
                className={`rounded-3xl border-0 shadow-sm ${stat.bgColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <p
                      className={`text-sm font-semibold uppercase tracking-wide ${stat.textColor}`}
                    >
                      {stat.title}
                    </p>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-4xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                    <p className={`text-sm ${stat.textColor} opacity-70`}>
                      {stat.subtitle}
                    </p>
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
                        formatter={(value: number) => [
                          `₹${value.toLocaleString()}`,
                          "Revenue",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(221, 83%, 53%)"
                        strokeWidth={2}
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
                  className="justify-start rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-800 border-0"
                >
                  <Link to="/vendor/products">
                    <Package className="mr-2 h-4 w-4" />
                    Manage Products
                  </Link>
                </Button>
                <Button
                  asChild
                  className="justify-start rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 border-0"
                >
                  <Link to="/vendor/orders">
                    <ShoppingCartIcon className="mr-2 h-4 w-4" />
                    View Orders
                  </Link>
                </Button>
                <Button
                  asChild
                  className="justify-start rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-800 border-0"
                >
                  <Link to="/vendor/invoices">
                    <FileText className="mr-2 h-4 w-4" />
                    Invoices
                  </Link>
                </Button>
                <Button
                  asChild
                  className="justify-start rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 border-0"
                >
                  <Link to="/vendor/reports">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Link>
                </Button>
                <Button
                  asChild
                  className="justify-start rounded-xl bg-pink-100 text-pink-700 hover:bg-pink-200 hover:text-pink-800 border-0"
                >
                  <Link to="/vendor/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/vendor/orders">
                  View All
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            {order.user.firstName} {order.user.lastName}
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            {order.items.length === 1
                              ? order.items[0].product.name
                              : `${order.items[0].product.name} +${order.items.length - 1} more`}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                order.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-700'
                                  : order.status === 'INVOICED'
                                    ? 'bg-blue-100 text-blue-700'
                                    : order.status === 'RETURNED'
                                      ? 'bg-gray-100 text-gray-700'
                                      : 'bg-red-100 text-red-700'
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{order.invoice ? Number(order.invoice.totalAmount).toLocaleString() : '0'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No orders yet. Orders will appear here once customers start renting your products.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </VendorLayout>
  );
}
