import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrders, Order } from "@/lib/ordersApi";
import { useAuthStore } from "@/stores/authStore";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Package,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

const statusConfig = {
  draft: {
    label: "Draft",
    icon: FileText,
    variant: "blue" as const,
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    variant: "green" as const,
  },
  ongoing: {
    label: "Ongoing",
    icon: TrendingUp,
    variant: "orange" as const,
  },
  returned: {
    label: "Returned",
    icon: CheckCircle2,
    variant: "green" as const,
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    variant: "red" as const,
  },
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedTab === "all") return true;
    return order.status === selectedTab;
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="mt-2 text-muted-foreground">
              Track and manage your rental orders
            </p>
          </motion.div>

          {/* Tabs */}
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="mb-8 grid w-full grid-cols-5 rounded-xl bg-white p-1 shadow-sm lg:w-auto">
              <TabsTrigger value="all" className="rounded-lg">
                All Orders
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="rounded-lg">
                Ongoing
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="rounded-lg">
                Confirmed
              </TabsTrigger>
              <TabsTrigger value="returned" className="rounded-lg">
                Returned
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-lg">
                Cancelled
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-6">
              {/* Loading State */}
              {loading && (
                <Card className="rounded-2xl">
                  <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
                    <Loader2 className="mb-4 h-16 w-16 animate-spin text-primary" />
                    <h3 className="mb-2 text-xl font-semibold">
                      Loading orders...
                    </h3>
                  </CardContent>
                </Card>
              )}

              {/* Error State */}
              {!loading && error && (
                <Card className="rounded-2xl border-red-200">
                  <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
                    <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
                    <h3 className="mb-2 text-xl font-semibold text-red-600">
                      Error loading orders
                    </h3>
                    <p className="text-muted-foreground">{error}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {!loading && !error && filteredOrders.length === 0 && (
                <Card className="rounded-2xl">
                  <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
                    <Package className="mb-4 h-16 w-16 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-semibold">
                      No orders found
                    </h3>
                    <p className="text-muted-foreground">
                      You don't have any orders in this category
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Orders List */}
              {!loading &&
                !error &&
                filteredOrders.length > 0 &&
                filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md">
                      <CardHeader className="border-b border-border bg-gray-50/50 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold">
                              {order.orderNumber}
                            </CardTitle>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {order.rentalPeriod.start ?
                                  format(
                                    new Date(order.rentalPeriod.start),
                                    "MMM dd",
                                  )
                                : "N/A"}{" "}
                                -{" "}
                                {order.rentalPeriod.end ?
                                  format(
                                    new Date(order.rentalPeriod.end),
                                    "MMM dd, yyyy",
                                  )
                                : "N/A"}
                              </span>
                            </div>
                          </div>
                          <StatusBadge
                            icon={statusConfig[order.status]?.icon || FileText}
                            label={
                              statusConfig[order.status]?.label || order.status
                            }
                            variant={
                              statusConfig[order.status]?.variant || "blue"
                            }
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          {/* Product Image */}
                          <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                            <img
                              src={order.productImage}
                              alt={order.productName}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Order Details */}
                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {order.productName}
                              </h3>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Package className="h-4 w-4" />
                                  <span>Quantity: {order.quantity}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{order.deliveryAddress}</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex items-center justify-between">
                              <div className="text-xl font-bold text-primary">
                                {formatPrice(order.totalAmount)}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Button>
                                {order.invoiceUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg"
                                    asChild
                                  >
                                    <a href={order.invoiceUrl} download>
                                      <Download className="mr-2 h-4 w-4" />
                                      Invoice
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
