import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Package,
  Calendar,
  MapPin,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Eye,
  Loader2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, downloadInvoicePDF, Order } from '@/lib/orderApi';
import { toast } from 'sonner';

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    icon: FileText,
    variant: 'blue' as const,
  },
  CONFIRMED: {
    label: 'Confirmed',
    icon: CheckCircle2,
    variant: 'green' as const,
  },
  INVOICED: {
    label: 'Ongoing',
    icon: TrendingUp,
    variant: 'orange' as const,
  },
  RETURNED: {
    label: 'Returned',
    icon: CheckCircle2,
    variant: 'green' as const,
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    variant: 'red' as const,
  },
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

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
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId: string, orderNumber: string) => {
    try {
      setDownloadingInvoice(orderId);
      await downloadInvoicePDF(orderId, orderNumber);
      toast.success('Invoice downloaded successfully');
    } catch (err: any) {
      console.error('Failed to download invoice:', err);
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handleViewDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedTab === 'all') return true;
    return order.status.toLowerCase() === selectedTab;
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
          {loading ? (
            <Card className="rounded-2xl">
              <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
                <Loader2 className="mb-4 h-16 w-16 animate-spin text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Loading orders...</h3>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="rounded-2xl">
              <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
                <XCircle className="mb-4 h-16 w-16 text-destructive" />
                <h3 className="mb-2 text-xl font-semibold">Failed to load orders</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={fetchOrders} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="mb-8 grid w-full grid-cols-5 rounded-xl bg-white p-1 shadow-sm lg:w-auto">
                <TabsTrigger value="all" className="rounded-lg">
                  All Orders
                </TabsTrigger>
                <TabsTrigger value="invoiced" className="rounded-lg">
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
                {filteredOrders.length === 0 ? (
                  <Card className="rounded-2xl">
                    <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
                      <Package className="mb-4 h-16 w-16 text-muted-foreground" />
                      <h3 className="mb-2 text-xl font-semibold">No orders found</h3>
                      <p className="text-muted-foreground">
                        You don't have any orders in this category
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredOrders.map((order, index) => {
                    const firstItem = order.items?.[0];
                    const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                    const totalAmount = order.invoice?.totalAmount
                      ? parseFloat(order.invoice.totalAmount)
                      : order.items?.reduce((sum, item) => sum + (item.quantity * parseFloat(item.unitPrice)), 0) || 0;

                    return (
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
                                {firstItem && (
                                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {format(new Date(firstItem.rentalStart), 'MMM dd')} -{' '}
                                      {format(new Date(firstItem.rentalEnd), 'MMM dd, yyyy')}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <StatusBadge
                                icon={statusConfig[order.status].icon}
                                label={statusConfig[order.status].label}
                                variant={statusConfig[order.status].variant}
                              />
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="flex gap-6">
                              {/* Product Image */}
                              {firstItem?.product && (
                                <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                  <img
                                    src={firstItem.product.product_image_url || 'https://via.placeholder.com/128'}
                                    alt={firstItem.product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}

                              {/* Order Details */}
                              <div className="flex flex-1 flex-col justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {firstItem?.product?.name || 'Order Items'}
                                  </h3>
                                  <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Package className="h-4 w-4" />
                                      <span>
                                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                        {order.items && order.items.length > 1 && ` (${order.items.length} products)`}
                                      </span>
                                    </div>
                                    {order.vendor && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>
                                          {order.vendor.companyName ||
                                            `${order.vendor.user.firstName} ${order.vendor.user.lastName}`}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="text-xl font-bold text-primary">
                                    {formatPrice(totalAmount)}
                                  </div>
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
                                        onClick={() => handleDownloadInvoice(order.id, order.orderNumber)}
                                        disabled={downloadingInvoice === order.id}
                                      >
                                        {downloadingInvoice === order.id ? (
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                          <Download className="mr-2 h-4 w-4" />
                                        )}
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
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
