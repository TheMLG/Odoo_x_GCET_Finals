import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Download,
  Printer,
  Mail,
  CheckCircle2,
  Clock,
  FileText,
  Building,
  User,
  MapPin,
  Phone,
  Calendar,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';

interface InvoiceItem {
  productName: string;
  quantity: number;
  rentalPeriod: string;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  date: Date;
  dueDate: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerGSTIN: string;
  companyName: string;
  companyAddress: string;
  companyGSTIN: string;
  items: InvoiceItem[];
  subtotal: number;
  gst: number;
  securityDeposit?: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
}

const mockInvoice: Invoice = {
  id: '1',
  invoiceNumber: 'INV-2026-001',
  orderNumber: 'RO-2026-001',
  status: 'paid',
  date: new Date(2026, 1, 10),
  dueDate: new Date(2026, 1, 13),
  customerName: 'Ronit Dhimmar',
  customerEmail: 'rajdhimmar4@gmail.com',
  customerPhone: '+91 8320331941',
  customerAddress: 'Mumbai, Maharashtra, India',
  customerGSTIN: '27AAAAA0000A1Z5',
  companyName: 'SharePal Rentals',
  companyAddress: 'Herengracht 133, Amsterdam',
  companyGSTIN: '09AAAAA0000A1ZF',
  items: [
    {
      productName: 'PS5 + 1 Controller(Digital or Disc)',
      quantity: 1,
      rentalPeriod: 'Feb 10 - Feb 13, 2026 (3 days)',
      rate: 462,
      amount: 1386,
    },
  ],
  subtotal: 1386,
  gst: 249,
  totalAmount: 1635,
  paidAmount: 1635,
  balanceDue: 0,
};

const statusConfig = {
  draft: { label: 'Draft', icon: FileText, variant: 'blue' as const },
  sent: { label: 'Sent', icon: Mail, variant: 'orange' as const },
  paid: { label: 'Paid', icon: CheckCircle2, variant: 'green' as const },
  cancelled: { label: 'Cancelled', icon: Clock, variant: 'red' as const },
};

export default function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoice = mockInvoice;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In production, this would trigger a PDF download
    console.log('Downloading invoice...');
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container px-4 md:px-6">
          {/* Header Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between print:hidden"
          >
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back to Orders
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </motion.div>

          {/* Invoice Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mx-auto max-w-4xl rounded-2xl shadow-lg">
              <CardContent className="p-8 md:p-12">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                  <div>
                    <div className="mb-2 flex h-12 items-center rounded-xl bg-blue-600 px-4">
                      <span className="text-xl font-bold text-white">
                        Share<span className="text-yellow-300">Pal</span>
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">{invoice.companyAddress}</p>
                    <p className="text-sm text-muted-foreground">GSTIN: {invoice.companyGSTIN}</p>
                  </div>
                  <div className="text-right">
                    <h1 className="mb-2 text-3xl font-bold">INVOICE</h1>
                    <StatusBadge
                      icon={statusConfig[invoice.status].icon}
                      label={statusConfig[invoice.status].label}
                      variant={statusConfig[invoice.status].variant}
                    />
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="mb-8 grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 font-semibold text-muted-foreground">Bill To:</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{invoice.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{invoice.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{invoice.customerPhone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="text-sm">{invoice.customerAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">GSTIN: {invoice.customerGSTIN}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl bg-gray-50 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Invoice Number:</span>
                      <span className="font-semibold">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Order Number:</span>
                      <span className="font-semibold">{invoice.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Invoice Date:</span>
                      <span className="font-semibold">{format(invoice.date, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <span className="font-semibold">{format(invoice.dueDate, 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8 overflow-hidden rounded-xl border border-border">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left text-sm font-semibold">Description</th>
                        <th className="p-4 text-center text-sm font-semibold">Qty</th>
                        <th className="p-4 text-right text-sm font-semibold">Rate</th>
                        <th className="p-4 text-right text-sm font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => (
                        <tr key={index} className="border-t border-border">
                          <td className="p-4">
                            <div className="font-medium">{item.productName}</div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {item.rentalPeriod}
                            </div>
                          </td>
                          <td className="p-4 text-center">{item.quantity}</td>
                          <td className="p-4 text-right">{formatPrice(item.rate)}</td>
                          <td className="p-4 text-right font-semibold">
                            {formatPrice(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="ml-auto max-w-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">{formatPrice(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18%):</span>
                    <span className="font-semibold">{formatPrice(invoice.gst)}</span>
                  </div>
                  {invoice.securityDeposit && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security Deposit:</span>
                      <span className="font-semibold">{formatPrice(invoice.securityDeposit)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-bold text-primary">
                      {formatPrice(invoice.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span className="font-semibold">Paid Amount:</span>
                    <span className="font-bold">{formatPrice(invoice.paidAmount)}</span>
                  </div>
                  {invoice.balanceDue > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span className="font-semibold">Balance Due:</span>
                      <span className="font-bold">{formatPrice(invoice.balanceDue)}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-12 border-t border-border pt-6">
                  <p className="text-center text-sm text-muted-foreground">
                    Thank you for choosing SharePal! For any queries, contact us at
                    support@sharepal.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
