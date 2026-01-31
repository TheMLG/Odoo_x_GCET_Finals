import { VendorLayout } from "@/components/layout/VendorLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  deleteVendorOrder,
  getVendorOrders,
  updateOrderStatus,
  VendorOrder,
} from "@/lib/vendorApi";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  Package,
  Search,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ORDER_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "INVOICED", label: "Invoiced" },
  { value: "RETURNED", label: "Returned" },
  { value: "CANCELLED", label: "Cancelled" },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return {
        label: "Confirmed",
        variant: "default" as const,
        icon: CheckCircle2,
        color: "text-green-500",
      };
    case "INVOICED":
      return {
        label: "Invoiced",
        variant: "secondary" as const,
        icon: FileText,
        color: "text-blue-500",
      };
    case "RETURNED":
      return {
        label: "Returned",
        variant: "outline" as const,
        icon: Package,
        color: "text-purple-500",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-500",
      };
    default:
      return {
        label: status,
        variant: "secondary" as const,
        icon: Clock,
        color: "text-gray-500",
      };
  }
};

export default function VendorOrders() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<VendorOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getVendorOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleViewOrder = (order: VendorOrder) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleDeleteClick = (order: VendorOrder) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      setIsDeleting(true);
      await deleteVendorOrder(orderToDelete.id);
      // Remove the order from local state immediately for instant feedback
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderToDelete.id),
      );
      toast.success("Order deleted successfully");
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error("Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const calculateOrderTotal = (order: VendorOrder) => {
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
    const matchesSearch =
      order.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">
              Manage and track your rental orders
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer or order ID..."
              className="pl-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading ?
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        : /* Orders Table */
          <Card className="rounded-2xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredOrders.map((order, index) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    const itemsSummary = order.items
                      .map((i) => `${i.product.name} (x${i.quantity})`)
                      .join(", ");
                    const rentalDuration =
                      order.items.length > 0 ?
                        `${format(new Date(order.items[0].rentalStart), "MMM d")} - ${format(new Date(order.items[0].rentalEnd), "MMM d")}`
                      : "N/A";

                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {order.user.firstName[0]}
                            </div>
                            <span className="truncate max-w-[120px]">
                              {order.user.firstName} {order.user.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="truncate block max-w-[200px]"
                            title={itemsSummary}
                          >
                            {itemsSummary}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {rentalDuration}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          ₹
                          {order.invoice ?
                            Number(order.invoice.totalAmount).toLocaleString()
                          : "0"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={statusConfig.variant}
                            className="rounded-md px-1.5 py-0.5 text-xs font-medium gap-1"
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {order.status === "CONFIRMED" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(order.id, "INVOICED")
                                  }
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Mark as Invoiced
                                </DropdownMenuItem>
                              )}
                              {order.status === "INVOICED" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(order.id, "RETURNED")
                                  }
                                >
                                  <Package className="mr-2 h-4 w-4" />
                                  Mark as Returned
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(order)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        }

        {/* Empty State */}
        {!isLoading && filteredOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No orders found</h3>
            <p className="text-muted-foreground">
              {orders.length === 0 ?
                "You haven't received any orders yet"
              : "No orders match your search or filter"}
            </p>
          </motion.div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              Complete details for order #
              {selectedOrder?.id.slice(-8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-semibold">
                    #{selectedOrder.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-semibold">
                    {format(new Date(selectedOrder.createdAt), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={getStatusConfig(selectedOrder.status).variant}
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Invoice Status
                  </p>
                  <Badge
                    variant={
                      selectedOrder.invoice?.status === "PAID" ?
                        "default"
                      : "secondary"
                    }
                  >
                    {selectedOrder.invoice?.status || "No Invoice"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Customer Details */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {selectedOrder.user ?
                        `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}`
                      : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {selectedOrder.user?.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rental Period */}
              {selectedOrder.items.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Rental Period
                    </h4>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Start Date
                        </p>
                        <p className="font-medium">
                          {selectedOrder.items[0]?.rentalStart ?
                            format(
                              new Date(selectedOrder.items[0].rentalStart),
                              "PPP",
                            )
                          : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          End Date
                        </p>
                        <p className="font-medium">
                          {selectedOrder.items[0]?.rentalEnd ?
                            format(
                              new Date(selectedOrder.items[0].rentalEnd),
                              "PPP",
                            )
                          : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Items
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Product
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-medium">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium">
                          Price
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.product?.images?.[0] && (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              )}
                              <span className="font-medium">
                                {item.product?.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatPrice(item.unitPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatPrice(
                              Number(item.unitPrice) * item.quantity,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(calculateOrderTotal(selectedOrder))}</span>
                </div>
                {selectedOrder.invoice?.gstAmount &&
                  Number(selectedOrder.invoice.gstAmount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST</span>
                      <span>
                        {formatPrice(selectedOrder.invoice.gstAmount)}
                      </span>
                    </div>
                  )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    {formatPrice(
                      selectedOrder.invoice?.totalAmount ||
                        calculateOrderTotal(selectedOrder),
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order #
              {orderToDelete?.id.slice(-8).toUpperCase()}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VendorLayout>
  );
}
