import { VendorLayout } from "@/components/layout/VendorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import api from "@/lib/api";
import { getVendorInvoices, VendorInvoice } from "@/lib/vendorApi";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
  IndianRupee,
  LayoutGrid,
  List,
  Loader2,
  Mail,
  MoreHorizontal,
  Search,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const INVOICE_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PAID", label: "Paid" },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "PAID":
      return {
        label: "Paid",
        variant: "default" as const,
        icon: CheckCircle2,
        color: "text-green-500",
        bgColor: "bg-green-100 dark:bg-green-900",
      };
    case "PARTIAL":
      return {
        label: "Partial",
        variant: "secondary" as const,
        icon: Clock,
        color: "text-orange-500",
        bgColor: "bg-orange-100 dark:bg-orange-900",
      };
    case "DRAFT":
      return {
        label: "Draft",
        variant: "outline" as const,
        icon: FileText,
        color: "text-blue-500",
        bgColor: "bg-blue-100 dark:bg-blue-900",
      };
    default:
      return {
        label: status,
        variant: "secondary" as const,
        icon: Clock,
        color: "text-gray-500",
        bgColor: "bg-gray-100 dark:bg-gray-900",
      };
  }
};

export default function VendorInvoices() {
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedInvoice, setSelectedInvoice] = useState<VendorInvoice | null>(
    null,
  );
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await getVendorInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInvoice = (invoice: VendorInvoice) => {
    setSelectedInvoice(invoice);
    setDetailsDialogOpen(true);
  };

  const handleDownloadInvoice = async (invoiceId: string, orderId: string) => {
    try {
      setDownloadingInvoice(invoiceId);
      const response = await api.get(`/vendor/invoices/${orderId}/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoiceId.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Failed to download invoice:", error);
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingInvoice(null);
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

  const calculatePaidAmount = (invoice: VendorInvoice) => {
    return invoice.payments.reduce(
      (total, payment) =>
        payment.status === "SUCCESS" ? total + Number(payment.amount) : total,
      0,
    );
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.order.user.firstName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      invoice.order.user.lastName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.order.user.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats
  const totalAmount = filteredInvoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount),
    0,
  );
  const paidAmount = filteredInvoices.reduce(
    (sum, inv) => sum + calculatePaidAmount(inv),
    0,
  );
  const pendingAmount = Math.max(0, totalAmount - paidAmount);

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
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">
              Track and manage all your rental invoices
            </p>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <Card className="rounded-2xl border border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{filteredInvoices.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
                <IndianRupee className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold">{formatPrice(paidAmount)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold">
                  {formatPrice(pendingAmount)}
                </p>
              </div>
            </CardContent>
          </Card>
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
              placeholder="Search by customer or invoice ID..."
              className="pl-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex items-center rounded-xl border bg-background p-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-lg px-3"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-lg px-3"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_STATUS_OPTIONS.map((option) => (
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
        : filteredInvoices.length === 0 ?
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all" ?
                "Try adjusting your search or filter criteria"
              : "Invoices will appear here when orders are placed"}
            </p>
          </motion.div>
        : viewMode === "list" ?
          /* List View */
          <Card className="rounded-2xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium">
                  <tr>
                    <th className="px-4 py-3">Invoice ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredInvoices.map((invoice, index) => {
                    const statusConfig = getStatusConfig(invoice.status);
                    const StatusIcon = statusConfig.icon;
                    const paidAmount = calculatePaidAmount(invoice);

                    return (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">
                          #{invoice.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {invoice.order.user.firstName[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="truncate max-w-[120px]">
                                {invoice.order.user.firstName}{" "}
                                {invoice.order.user.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {invoice.order.user.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatPrice(invoice.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-green-600 font-medium">
                          {formatPrice(paidAmount)}
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
                                onClick={() => handleViewInvoice(invoice)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDownloadInvoice(
                                    invoice.id,
                                    invoice.orderId,
                                  )
                                }
                                disabled={downloadingInvoice === invoice.id}
                              >
                                {downloadingInvoice === invoice.id ?
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                : <Download className="mr-2 h-4 w-4" />}
                                Download PDF
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
        : /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map((invoice, index) => {
              const statusConfig = getStatusConfig(invoice.status);
              const StatusIcon = statusConfig.icon;
              const paidAmount = calculatePaidAmount(invoice);

              return (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card className="rounded-2xl border border-border/50 hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Invoice
                          </p>
                          <p className="font-semibold">
                            #{invoice.id.slice(0, 8)}
                          </p>
                        </div>
                        <Badge
                          variant={statusConfig.variant}
                          className="rounded-md px-1.5 py-0.5 text-xs font-medium gap-1"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Customer */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {invoice.order.user.firstName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {invoice.order.user.firstName}{" "}
                            {invoice.order.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {invoice.order.user.email}
                          </p>
                        </div>
                      </div>

                      {/* Amount Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Total Amount
                          </span>
                          <span className="font-semibold">
                            {formatPrice(invoice.totalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Paid Amount
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatPrice(paidAmount)}
                          </span>
                        </div>
                        {invoice.gstAmount && Number(invoice.gstAmount) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              GST Included
                            </span>
                            <span className="text-muted-foreground">
                              {formatPrice(invoice.gstAmount)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                      </div>

                      <Separator className="mb-4" />

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-lg"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 rounded-lg"
                          onClick={() =>
                            handleDownloadInvoice(invoice.id, invoice.orderId)
                          }
                          disabled={downloadingInvoice === invoice.id}
                        >
                          {downloadingInvoice === invoice.id ?
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <Download className="mr-2 h-4 w-4" />}
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        }

        {/* Invoice Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Details
              </DialogTitle>
              <DialogDescription>
                Invoice #{selectedInvoice?.id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant={getStatusConfig(selectedInvoice.status).variant}
                    className="rounded-md px-2 py-1 text-sm font-medium gap-1"
                  >
                    {(() => {
                      const StatusIcon = getStatusConfig(
                        selectedInvoice.status,
                      ).icon;
                      return <StatusIcon className="h-4 w-4" />;
                    })()}
                    {getStatusConfig(selectedInvoice.status).label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(
                      new Date(selectedInvoice.createdAt),
                      "MMMM d, yyyy",
                    )}
                  </span>
                </div>

                <Separator />

                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h4>
                  <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {selectedInvoice.order.user.firstName[0]}
                      </div>
                      <div>
                        <p className="font-medium">
                          {selectedInvoice.order.user.firstName}{" "}
                          {selectedInvoice.order.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedInvoice.order.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedInvoice.order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 bg-muted/50 rounded-xl p-3"
                      >
                        <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Amount Summary */}
                <div>
                  <h4 className="font-semibold mb-3">Amount Summary</h4>
                  <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>
                        {formatPrice(
                          Number(selectedInvoice.totalAmount) -
                            Number(selectedInvoice.gstAmount),
                        )}
                      </span>
                    </div>
                    {Number(selectedInvoice.gstAmount) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST (18%)</span>
                        <span>{formatPrice(selectedInvoice.gstAmount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount</span>
                      <span>{formatPrice(selectedInvoice.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Paid Amount</span>
                      <span>
                        {formatPrice(calculatePaidAmount(selectedInvoice))}
                      </span>
                    </div>
                    {Number(selectedInvoice.totalAmount) -
                      calculatePaidAmount(selectedInvoice) >
                      0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Balance Due</span>
                        <span>
                          {formatPrice(
                            Number(selectedInvoice.totalAmount) -
                              calculatePaidAmount(selectedInvoice),
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payments */}
                {selectedInvoice.payments.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment History
                    </h4>
                    <div className="space-y-2">
                      {selectedInvoice.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between bg-muted/50 rounded-xl p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                payment.status === "SUCCESS" ?
                                  "bg-green-100 dark:bg-green-900"
                                : "bg-orange-100 dark:bg-orange-900"
                              }`}
                            >
                              {payment.status === "SUCCESS" ?
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              : <Clock className="h-4 w-4 text-orange-500" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {payment.mode}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {payment.paidAt ?
                                  format(
                                    new Date(payment.paidAt),
                                    "MMM d, yyyy",
                                  )
                                : "Pending"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatPrice(payment.amount)}
                            </p>
                            <Badge
                              variant={
                                payment.status === "SUCCESS" ?
                                  "default"
                                : "secondary"
                              }
                              className="text-xs"
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() =>
                      handleDownloadInvoice(
                        selectedInvoice.id,
                        selectedInvoice.orderId,
                      )
                    }
                    disabled={downloadingInvoice === selectedInvoice.id}
                  >
                    {downloadingInvoice === selectedInvoice.id ?
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Download className="mr-2 h-4 w-4" />}
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </VendorLayout>
  );
}
