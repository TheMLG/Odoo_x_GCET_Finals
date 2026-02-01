import { VendorLayout } from "@/components/layout/VendorLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getVendorAnalytics, VendorAnalyticsData } from "@/lib/vendorApi";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart3,
  Download,
  IndianRupee,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#6b7280"];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#3b82f6",
  },
  orders: {
    label: "Orders",
    color: "#10b981",
  },
} satisfies ChartConfig;

export default function VendorReportsAnalytics() {
  const [timeRange, setTimeRange] = useState("year");
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] =
    useState<VendorAnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await getVendorAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch analytics"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrencyValue = (value: any) => {
    if (typeof value === "number") return value.toLocaleString();
    if (typeof value === "string") {
      const clean = value.replace(/[₹,]/g, "").trim();
      const lower = clean.toLowerCase();

      if (lower.endsWith("k")) {
        const num = parseFloat(lower.replace("k", ""));
        return (num * 1000).toLocaleString();
      }
      if (lower.endsWith("m")) {
        const num = parseFloat(lower.replace("m", ""));
        return (num * 1000000).toLocaleString();
      }

      const num = parseFloat(clean);
      return !isNaN(num) ? num.toLocaleString() : clean;
    }
    return value;
  };

  const handleExport = () => {
    if (!analyticsData) return;

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Title
    doc.setFontSize(20);
    doc.text("Vendor Analytics Report", 14, 22);

    doc.setFontSize(10);
    doc.text(`Generated on: ${date}`, 14, 30);
    doc.text(
      `Time Range: ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`,
      14,
      35,
    );

    // Summary Stats
    doc.setFontSize(14);
    doc.text("Summary Statistics", 14, 45);

    const summaryData = [
      [
        "Total Revenue",
        `Rs. ${formatCurrencyValue(analyticsData.stats.totalRevenue)}`,
      ],
      ["Total Orders", analyticsData.stats.totalOrders],
      ["Active Rentals", analyticsData.stats.activeRentals],
      ["Products Listed", analyticsData.stats.productsListed],
    ];

    autoTable(doc, {
      startY: 50,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Revenue Trends
    let lastY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Revenue & Order Trends", 14, lastY);

    const revenueTableData = analyticsData.revenueData.map((item) => [
      item.month,
      `Rs. ${formatCurrencyValue(item.revenue)}`,
      item.orders,
    ]);

    autoTable(doc, {
      startY: lastY + 5,
      head: [["Month/Period", "Revenue", "Orders"]],
      body: revenueTableData,
      theme: "striped",
      headStyles: { fillColor: [16, 185, 129] },
    });

    // Top Products
    lastY = (doc as any).lastAutoTable.finalY + 15;

    if (lastY > 250) {
      doc.addPage();
      lastY = 20;
    }

    doc.setFontSize(14);
    doc.text("Top Performing Products", 14, lastY);

    const productTableData = analyticsData.topProducts.map((item) => [
      item.name,
      item.rentals,
      `Rs. ${formatCurrencyValue(item.revenue)}`,
    ]);

    autoTable(doc, {
      startY: lastY + 5,
      head: [["Product Name", "Rentals", "Revenue"]],
      body: productTableData,
      theme: "striped",
      headStyles: { fillColor: [249, 115, 22] },
    });

    // Save PDF
    doc.save(
      `vendor_analytics_${timeRange}_${new Date().toISOString().split("T")[0]}.pdf`,
    );

    toast.success("Report downloaded successfully");
  };

  if (isLoading || !analyticsData) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: analyticsData.stats.totalRevenue,
      icon: IndianRupee,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Total Orders",
      value: analyticsData.stats.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Rentals",
      value: analyticsData.stats.activeRentals,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Products Listed",
      value: analyticsData.stats.productsListed,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <VendorLayout>
      <div className="container px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="h-8 w-8" />
                Reports & Analytics
              </h1>
              <p className="text-muted-foreground">
                Your business insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button className="rounded-xl" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
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
                      className={`text-sm font-semibold uppercase tracking-wide ${stat.color}`}
                    >
                      {stat.title}
                    </p>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-4xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Your revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={chartConfig}
                    className="h-full w-full"
                  >
                    <AreaChart data={analyticsData.revenueData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent indicator="line" />}
                        cursor={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        strokeWidth={2}
                        fill="var(--color-revenue)"
                        fillOpacity={0.1}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={chartConfig}
                    className="h-full w-full"
                  >
                    <PieChart>
                      <Pie
                        data={analyticsData.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                      >
                        {analyticsData.categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Legend
                        content={<ChartLegendContent />}
                        wrapperStyle={{ paddingTop: "20px" }}
                      />
                    </PieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Orders Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Orders Overview</CardTitle>
              <CardDescription>Orders trend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart data={analyticsData.revenueData} barGap={8}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="dashed" />}
                      cursor={false}
                    />
                    <Legend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="orders"
                      fill="var(--color-orders)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>
                Your best products by rentals and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topProducts.length > 0 ?
                  analyticsData.topProducts.map((product, index) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.rentals} rentals
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-green-600 flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        {(product.revenue || 0).toLocaleString()}
                      </p>
                    </div>
                  ))
                  : <p className="text-center text-muted-foreground py-8">
                    No product data available for this time period
                  </p>
                }
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </VendorLayout>
  );
}
