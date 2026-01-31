import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Calendar,
    Package,
    MapPin,
    Download,
    Loader2,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { getOrderById, downloadInvoicePDF } from '@/lib/orderApi';
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

export default function OrderDetailPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getOrderById(orderId!);
            setOrder(data);
        } catch (err: any) {
            console.error('Failed to fetch order details:', err);
            setError(err.response?.data?.message || 'Failed to load order details');
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!order) return;
        try {
            setDownloadingInvoice(true);
            await downloadInvoicePDF(order.id, order.orderNumber);
            toast.success('Invoice downloaded successfully');
        } catch (err: any) {
            console.error('Failed to download invoice:', err);
            toast.error('Failed to download invoice');
        } finally {
            setDownloadingInvoice(false);
        }
    };

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(numPrice);
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Loading order details...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error || !order) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50">
                    <div className="container px-4 py-8 md:px-6">
                        <Card className="max-w-md mx-auto">
                            <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
                                <XCircle className="mb-4 h-16 w-16 text-destructive" />
                                <h3 className="mb-2 text-xl font-semibold">Order not found</h3>
                                <p className="text-center text-muted-foreground mb-4">
                                    {error || 'The order you are looking for does not exist.'}
                                </p>
                                <Button onClick={() => navigate('/orders')}>
                                    Back to Orders
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const totalAmount = order.invoice?.totalAmount
        ? parseFloat(order.invoice.totalAmount)
        : order.items?.reduce((sum: number, item: any) => sum + (item.quantity * parseFloat(item.unitPrice)), 0) || 0;

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
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="mb-4"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>

                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Order Details</h1>
                                <p className="mt-2 text-xl text-muted-foreground">
                                    {order.orderNumber}
                                </p>
                            </div>
                            <StatusBadge
                                icon={statusConfig[order.status].icon}
                                label={statusConfig[order.status].label}
                                variant={statusConfig[order.status].variant}
                            />
                        </div>
                    </motion.div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Items</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {order.items?.map((item: any) => (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                <img
                                                    src={item.product.product_image_url || 'https://via.placeholder.com/96'}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{item.product.name}</h3>
                                                {item.product.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {item.product.description}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                        <span>Qty: {item.quantity}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {format(new Date(item.rentalStart), 'MMM dd')} -{' '}
                                                            {format(new Date(item.rentalEnd), 'MMM dd, yyyy')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-lg font-semibold">
                                                    {formatPrice(item.quantity * parseFloat(item.unitPrice))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Vendor Information */}
                            {order.vendor && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Vendor Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm text-muted-foreground">Company:</span>
                                                <p className="font-medium">
                                                    {order.vendor.companyName ||
                                                        `${order.vendor.user.firstName} ${order.vendor.user.lastName}`}
                                                </p>
                                            </div>
                                            {order.vendor.gstNo && (
                                                <div>
                                                    <span className="text-sm text-muted-foreground">GST No:</span>
                                                    <p className="font-medium">{order.vendor.gstNo}</p>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-sm text-muted-foreground">Contact:</span>
                                                <p className="font-medium">{order.vendor.user.email}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Order Date</span>
                                            <span className="font-medium">
                                                {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="font-medium capitalize">{order.status.toLowerCase()}</span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span>{formatPrice(totalAmount)}</span>
                                        </div>
                                    </div>

                                    {order.invoice && (
                                        <Button
                                            onClick={handleDownloadInvoice}
                                            disabled={downloadingInvoice}
                                            className="w-full"
                                        >
                                            {downloadingInvoice ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Downloading...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download Invoice
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Payment Info */}
                            {order.invoice && order.invoice.payments && order.invoice.payments.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {order.invoice.payments.map((payment: any) => (
                                            <div key={payment.id} className="pb-3 border-b last:border-0 last:pb-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{payment.mode}</p>
                                                        {payment.transactionId && (
                                                            <p className="text-sm text-muted-foreground">
                                                                ID: {payment.transactionId}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'SUCCESS'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                            }`}
                                                    >
                                                        {payment.status}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-lg font-semibold">
                                                    {formatPrice(payment.amount)}
                                                </p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
