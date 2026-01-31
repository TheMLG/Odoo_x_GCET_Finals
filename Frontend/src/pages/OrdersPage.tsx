import { useState } from 'react';
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
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  status: 'draft' | 'confirmed' | 'ongoing' | 'returned' | 'cancelled';
  productName: string;
  productImage: string;
  quantity: number;
  rentalPeriod: {
    start: Date;
    end: Date;
  };
  totalAmount: number;
  invoiceUrl?: string;
  deliveryAddress: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'RO-2026-001',
    status: 'ongoing',
    productName: 'PS5 + 1 Controller(Digital or Disc)',
    productImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400',
    quantity: 1,
    rentalPeriod: {
      start: new Date(2026, 1, 10),
      end: new Date(2026, 1, 13),
    },
    totalAmount: 1385,
    invoiceUrl: '#',
    deliveryAddress: 'Herengracht 133, Amsterdam',
  },
  {
    id: '2',
    orderNumber: 'RO-2026-002',
    status: 'returned',
    productName: 'Canon EOS R5 Camera',
    productImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
    quantity: 1,
    rentalPeriod: {
      start: new Date(2026, 0, 15),
      end: new Date(2026, 0, 20),
    },
    totalAmount: 5500,
    invoiceUrl: '#',
    deliveryAddress: 'Mumbai, Maharashtra',
  },
];

const statusConfig = {
  draft: {
    label: 'Draft',
    icon: FileText,
    variant: 'blue' as const,
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    variant: 'green' as const,
  },
  ongoing: {
    label: 'Ongoing',
    icon: TrendingUp,
    variant: 'orange' as const,
  },
  returned: {
    label: 'Returned',
    icon: CheckCircle2,
    variant: 'green' as const,
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    variant: 'red' as const,
  },
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState('all');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredOrders = mockOrders.filter((order) => {
    if (selectedTab === 'all') return true;
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
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
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
                                {format(order.rentalPeriod.start, 'MMM dd')} -{' '}
                                {format(order.rentalPeriod.end, 'MMM dd, yyyy')}
                              </span>
                            </div>
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
                              <h3 className="text-lg font-semibold">{order.productName}</h3>
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
                                <Button variant="outline" size="sm" className="rounded-lg">
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
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
