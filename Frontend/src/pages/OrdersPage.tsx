/* eslint-disable @typescript-eslint/no-explicit-any */
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadInvoicePDF, getUserOrders, Order } from "@/lib/orderApi";
import { useAuthStore } from "@/stores/authStore";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Building,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Loader2,
  Mail,
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

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

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const calculateOrderTotal = (order: Order) => {
    return order.items.reduce((total, item) => {
      const days = Math.ceil(
        (new Date(item.rentalEnd).getTime() -
          new Date(item.rentalStart).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return total + Number(item.unitPrice) * item.quantity * Math.max(days, 1);
    }, 0);
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
                                    onClick={() => handleViewDetails(order)}
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

      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold">
                    Order Details
                  </DialogTitle>
                  <StatusBadge
                    label={
                      statusConfig[
                        selectedOrder.status.toLowerCase() as keyof typeof statusConfig
                      ]?.label || "Draft"
                    }
                    variant={
                      statusConfig[
                        selectedOrder.status.toLowerCase() as keyof typeof statusConfig
                      ]?.variant || "blue"
                    }
                    icon={
                      statusConfig[
                        selectedOrder.status.toLowerCase() as keyof typeof statusConfig
                      ]?.icon || FileText
                    }
                  />
                </div>
                <DialogDescription className="sr-only">
                  View order details including items, vendor information, and
                  invoice
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3 rounded-xl bg-gray-50 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Order Number:
                      </span>
                      <span className="font-semibold">
                        #{selectedOrder.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Order Date:
                      </span>
                      <span className="font-semibold">
                        {format(
                          new Date(selectedOrder.createdAt),
                          "MMM dd, yyyy",
                        )}
                      </span>
                    </div>
                    {selectedOrder.invoice && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Invoice Number:
                        </span>
                        <span className="font-semibold">
                          {selectedOrder.invoice.invoiceNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Vendor Info */}
                  <div className="space-y-2">
                    <h3 className="mb-3 font-semibold text-muted-foreground">
                      Vendor:
                    </h3>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {selectedOrder.vendor?.companyName ||
                          `${selectedOrder.vendor?.user?.firstName} ${selectedOrder.vendor?.user?.lastName}`}
                      </span>
                    </div>
                    {selectedOrder.vendor?.user?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedOrder.vendor.user.email}
                        </span>
                      </div>
                    )}
                    {selectedOrder.vendor?.gstNo && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          GSTIN: {selectedOrder.vendor.gstNo}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left text-sm font-semibold">
                          Product
                        </th>
                        <th className="p-4 text-center text-sm font-semibold">
                          Qty
                        </th>
                        <th className="p-4 text-right text-sm font-semibold">
                          Rate/Day
                        </th>
                        <th className="p-4 text-right text-sm font-semibold">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => {
                        const days = Math.ceil(
                          (new Date(item.rentalEnd).getTime() -
                            new Date(item.rentalStart).getTime()) /
                            (1000 * 60 * 60 * 24),
                        );
                        const itemTotal =
                          Number(item.unitPrice) *
                          item.quantity *
                          Math.max(days, 1);
                        return (
                          <tr key={item.id} className="border-t border-border">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="relative h-12 w-12 overflow-hidden rounded-lg border bg-white">
                                  <img
                                    src={item.product?.product_image_url}
                                    alt={item.product?.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {item.product?.name}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {format(
                                      new Date(item.rentalStart),
                                      "MMM dd",
                                    )}{" "}
                                    -{" "}
                                    {format(
                                      new Date(item.rentalEnd),
                                      "MMM dd, yyyy",
                                    )}{" "}
                                    ({Math.max(days, 1)} days)
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">{item.quantity}</td>
                            <td className="p-4 text-right">
                              {formatPrice(item.unitPrice)}
                            </td>
                            <td className="p-4 text-right font-semibold">
                              {formatPrice(itemTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="ml-auto max-w-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">
                      {formatPrice(calculateOrderTotal(selectedOrder))}
                    </span>
                  </div>
                  {selectedOrder.invoice && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Total Amount:</span>
                        <span className="font-bold text-primary">
                          {formatPrice(selectedOrder.invoice.totalAmount)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 border-t pt-4">
                  {selectedOrder.invoice && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleDownloadInvoice(
                          selectedOrder.id,
                          selectedOrder.orderNumber,
                        )
                      }
                      disabled={downloadingInvoice === selectedOrder.id}
                    >
                      {downloadingInvoice === selectedOrder.id ?
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : <Download className="mr-2 h-4 w-4" />}
                      Download Invoice
                    </Button>
                  )}
                  <Button onClick={() => setDetailsDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
