/* eslint-disable @typescript-eslint/no-explicit-any */
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadInvoicePDF, getUserOrders, Order } from "@/lib/orderApi";
import { useAuthStore } from "@/stores/authStore";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Cleaned up statusConfig with lowercase keys support
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
  invoiced: {
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
  // Fallbacks for uppercase keys
  DRAFT: {
    label: "Draft",
    icon: FileText,
    variant: "blue" as const,
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    variant: "green" as const,
  },
  INVOICED: {
    label: "Ongoing",
    icon: TrendingUp,
    variant: "orange" as const,
  },
  RETURNED: {
    label: "Returned",
    icon: CheckCircle2,
    variant: "green" as const,
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    variant: "red" as const,
  },
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserOrders();
      setOrders(data);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError(err.response?.data?.message || "Failed to load orders");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (
    orderId: string,
    orderNumber: string,
  ) => {
    try {
      setDownloadingInvoice(orderId);
      await downloadInvoicePDF(orderId, orderNumber);
      toast.success("Invoice downloaded successfully");
    } catch (err: any) {
      console.error("Failed to download invoice:", err);
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handleViewDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedTab === "all") return true;
    return order.status.toLowerCase() === selectedTab;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

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

            <TabsContent value={selectedTab} className="mt-0">
              {filteredOrders.length === 0 ?
                <Card className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <CardContent>
                    <div className="mb-4 rounded-full bg-blue-50 p-4">
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold">No orders found</h3>
                    <p className="mt-2 text-muted-foreground">
                      You haven&apos;t placed any orders in this category yet.
                    </p>
                    <Button
                      className="mt-6 bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate("/")}
                    >
                      Start Renting
                    </Button>
                  </CardContent>
                </Card>
              : filteredOrders.map((order) => {
                  const status =
                    statusConfig[
                      order.status.toLowerCase() as keyof typeof statusConfig
                    ] || statusConfig.draft;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4"
                    >
                      <Card className="overflow-hidden border-none shadow-sm transition-all hover:shadow-md">
                        <CardContent className="p-0">
                          {/* Header */}
                          <div className="border-b bg-gray-50/50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                                  <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    Order #{order.orderNumber}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Placed on{" "}
                                    {format(
                                      new Date(order.createdAt),
                                      "MMM d, yyyy",
                                    )}
                                  </p>
                                </div>
                              </div>
                              <StatusBadge
                                label={status.label}
                                variant={status.variant}
                                icon={status.icon}
                              />
                            </div>
                          </div>
                          {/* Items */}
                          <div className="p-4">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="mb-4 last:mb-0 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-white">
                                    <img
                                      src={item.product?.product_image_url}
                                      alt={item.product?.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">
                                      {item.product?.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      Qty: {item.quantity} •{" "}
                                      {formatPrice(item.unitPrice)}/day
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">
                                    {formatPrice(
                                      Number(item.unitPrice) * item.quantity,
                                    )}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {/* Footer */}
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {order.vendor?.companyName ||
                                  order.vendor?.user?.firstName ||
                                  "Unknown Vendor"}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg"
                                    onClick={() => handleViewDetails(order.id)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Button>
                                  {order.invoice && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-lg"
                                      onClick={() =>
                                        handleDownloadInvoice(
                                          order.id,
                                          order.orderNumber,
                                        )
                                      }
                                      disabled={downloadingInvoice === order.id}
                                    >
                                      {downloadingInvoice === order.id ?
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      : <Download className="mr-2 h-4 w-4" />}
                                      Invoice
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              }
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
