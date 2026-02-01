import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from "sonner";
import api from '@/lib/api';
import {
  Store,
  Search,
  Mail,
  Phone,
  Package,
  Calendar,
  FileText,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Vendor {
  id: string;
  companyName: string;
  gstNo: string;
  product_category: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  products?: any[];
}

export default function ManageVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/vendors');
      setVendors(response.data.data);
    } catch (error: any) {
      toast.error('Failed to fetch vendors', {
        description: error.response?.data?.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewVendor = (vendor: Vendor) => {
    setViewingVendor(vendor);
    setIsViewDialogOpen(true);
  };

  const filteredVendors = vendors.filter(vendor => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vendor.companyName.toLowerCase().includes(searchLower) ||
      vendor.user.email.toLowerCase().includes(searchLower) ||
      vendor.gstNo.toLowerCase().includes(searchLower) ||
      vendor.product_category.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AdminLayout>
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
                <Store className="h-8 w-8" />
                Manage Vendors
              </h1>
              <p className="text-muted-foreground">
                View and manage all registered vendors
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 rounded-2xl">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search vendors by company name, email, GST, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-3xl border-0 shadow-sm bg-blue-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                    Total Vendors
                  </p>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                    <Store className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-4xl font-bold text-blue-700">{vendors.length}</p>
                  <p className="text-sm text-blue-700 opacity-70">Registered vendors</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="rounded-3xl border-0 shadow-sm bg-green-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                    Total Products
                  </p>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-4xl font-bold text-green-700">
                    {vendors.reduce((sum, v) => sum + (v.products?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-green-700 opacity-70">Products listed</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-3xl border-0 shadow-sm bg-purple-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
                    Categories
                  </p>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-4xl font-bold text-purple-700">
                    {new Set(vendors.map(v => v.product_category)).size}
                  </p>
                  <p className="text-sm text-purple-700 opacity-70">Product categories</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Vendors Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>All Vendors ({filteredVendors.length})</CardTitle>
              <CardDescription>
                Complete list of registered vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading vendors...</div>
              ) : filteredVendors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No vendors found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>GST Number</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Store className="h-4 w-4 text-muted-foreground" />
                              {vendor.companyName}
                            </div>
                          </TableCell>
                          <TableCell>
                            {vendor.user.firstName} {vendor.user.lastName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {vendor.user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{vendor.gstNo}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700">
                              {vendor.product_category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {vendor.products?.length || 0} products
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(vendor.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleViewVendor(vendor)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* View Vendor Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>
              Complete information about this vendor
            </DialogDescription>
          </DialogHeader>
          {viewingVendor && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <p className="text-sm font-semibold text-muted-foreground">Company Name</p>
                <p className="text-xl font-bold">{viewingVendor.companyName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <p className="text-sm font-semibold text-muted-foreground">Owner Name</p>
                  <p className="text-base">{viewingVendor.user.firstName} {viewingVendor.user.lastName}</p>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm font-semibold text-muted-foreground">Email</p>
                  <p className="text-base">{viewingVendor.user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <p className="text-sm font-semibold text-muted-foreground">GST Number</p>
                  <Badge variant="outline" className="w-fit">{viewingVendor.gstNo}</Badge>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm font-semibold text-muted-foreground">Category</p>
                  <Badge className="bg-blue-100 text-blue-700 w-fit">{viewingVendor.product_category}</Badge>
                </div>
              </div>
              <div className="grid gap-2">
                <p className="text-sm font-semibold text-muted-foreground">Products Listed</p>
                <p className="text-base">{viewingVendor.products?.length || 0} products</p>
              </div>
              <div className="grid gap-2">
                <p className="text-sm font-semibold text-muted-foreground">Joined Date</p>
                <p className="text-base">{new Date(viewingVendor.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
