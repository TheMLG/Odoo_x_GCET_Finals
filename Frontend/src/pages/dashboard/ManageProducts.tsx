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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import {
  Package,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Store,
  Edit,
  Trash2,
  IndianRupee,
  LayoutGrid,
  List,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Product {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  vendor: {
    id: string;
    companyName: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  inventory?: {
    quantityOnHand: number;
    quantityAvailable: number;
  };
  pricing?: {
    pricePerDay: number;
    pricePerWeek: number;
    pricePerMonth: number;
  };
}

export default function ManageProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // ... (fetchProducts)

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    setIsUpdating(true);
    try {
      const response = await api.put(`/admin/products/${editingProduct.id}`, {
        name: editingProduct.name,
        description: editingProduct.description,
        isPublished: editingProduct.isPublished,
        inventory: {
          quantityOnHand: editingProduct.inventory?.quantityOnHand
        },
        pricing: {
          pricePerDay: editingProduct.pricing?.pricePerDay,
          pricePerWeek: editingProduct.pricing?.pricePerWeek,
          pricePerMonth: editingProduct.pricing?.pricePerMonth
        }
      });

      setProducts(prevProducts => prevProducts.map(p =>
        p.id === editingProduct.id ? response.data.data : p
      ));

      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      setEditingProduct(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, statusFilter]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: currentPage, limit: 10 };
      if (statusFilter !== 'all') {
        params.isPublished = statusFilter === 'published' ? 'true' : 'false';
      }

      const response = await api.get('/admin/products', { params });
      setProducts(response.data.data.products);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    try {
      await api.delete(`/admin/products/${deletingProduct.id}`);

      setProducts(prevProducts => prevProducts.filter(p => p.id !== deletingProduct.id));

      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setDeletingProduct(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.vendor.companyName.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: products.length,
    published: products.filter(p => p.isPublished).length,
    unpublished: products.filter(p => !p.isPublished).length,
    totalInventory: products.reduce((sum, p) => sum + (p.inventory?.quantityOnHand || 0), 0),
  };

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
                <Package className="h-8 w-8" />
                Manage Products
              </h1>
              <p className="text-muted-foreground">
                View and manage all products in the catalog
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-3xl border-0 shadow-sm bg-blue-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                    Total Products
                  </p>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-4xl font-bold text-blue-700">{stats.total}</p>
                  <p className="text-sm text-blue-700 opacity-70">All products</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="rounded-3xl border-0 shadow-sm bg-green-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                    Published
                  </p>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-4xl font-bold text-green-700">{stats.published}</p>
                  <p className="text-sm text-green-700 opacity-70">Live products</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-3xl border-0 shadow-sm bg-red-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
                    Unpublished
                  </p>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-4xl font-bold text-red-700">{stats.unpublished}</p>
                  <p className="text-sm text-red-700 opacity-70">Draft products</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="rounded-3xl border-0 shadow-sm bg-purple-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
                    Total Stock
                  </p>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-4xl font-bold text-purple-700">{stats.totalInventory}</p>
                  <p className="text-sm text-purple-700 opacity-70">Units available</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6 rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name or vendor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                <div className="flex items-center rounded-xl border bg-background p-1">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-lg px-3"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-lg px-3"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="unpublished">Unpublished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Products View - List or Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No products found
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>All Products ({filteredProducts.length})</CardTitle>
                <CardDescription>
                  Complete catalog of products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Price/Day</TableHead>
                        <TableHead>Price/Week</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Store className="h-4 w-4 text-muted-foreground" />
                              {product.vendor.companyName}
                            </div>
                          </TableCell>
                          <TableCell>
                            {product.isPublished ? (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Published
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700">
                                <XCircle className="mr-1 h-3 w-3" />
                                Unpublished
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {product.inventory?.quantityOnHand || 0} units
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-3.5 w-3.5" />
                              {product.pricing?.pricePerDay || 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-3.5 w-3.5" />
                              {product.pricing?.pricePerWeek || 0}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleViewProduct(product)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => openDeleteDialog(product)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className="p-4 hover:shadow-md transition-shadow border-border/50 h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-medium">{product.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mr-1 -mt-1"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(product)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Store className="h-4 w-4" />
                      <span className="truncate">{product.vendor.companyName}</span>
                    </div>
                    <div>
                      {product.isPublished ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Published
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">
                          <XCircle className="mr-1 h-3 w-3" />
                          Unpublished
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {product.inventory?.quantityOnHand || 0} units
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Price/Day:</span>
                      <span className="flex items-center gap-0.5 font-medium">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {product.pricing?.pricePerDay || 0}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Complete information about this product
            </DialogDescription>
          </DialogHeader>
          {viewingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <p className="text-sm font-semibold text-muted-foreground">Product Name</p>
                <p className="text-base">{viewingProduct.name}</p>
              </div>
              <div className="grid gap-2">
                <p className="text-sm font-semibold text-muted-foreground">Description</p>
                <p className="text-base">{viewingProduct.description || 'No description'}</p>
              </div>
              <div className="grid gap-2">
                <p className="text-sm font-semibold text-muted-foreground">Vendor</p>
                <p className="text-base">{viewingProduct.vendor.companyName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <p className="text-sm font-semibold text-muted-foreground">Status</p>
                  <Badge className={viewingProduct.isPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {viewingProduct.isPublished ? 'Published' : 'Unpublished'}
                  </Badge>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm font-semibold text-muted-foreground">Stock</p>
                  <p className="text-base">{viewingProduct.inventory?.quantityOnHand || 0} units</p>
                </div>
              </div>
              <div className="grid gap-2">
                <p className="text-sm font-semibold text-muted-foreground">Pricing</p>
                <div className="space-y-1">
                  <p className="text-sm flex items-center gap-1">Per Day: <IndianRupee className="h-3.5 w-3.5" />{viewingProduct.pricing?.pricePerDay || 0}</p>
                  <p className="text-sm flex items-center gap-1">Per Week: <IndianRupee className="h-3.5 w-3.5" />{viewingProduct.pricing?.pricePerWeek || 0}</p>
                  <p className="text-sm flex items-center gap-1">Per Month: <IndianRupee className="h-3.5 w-3.5" />{viewingProduct.pricing?.pricePerMonth || 0}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingProduct.isPublished ? 'published' : 'unpublished'}
                    onValueChange={(value) => setEditingProduct({ ...editingProduct, isPublished: value === 'published' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="unpublished">Unpublished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={editingProduct.inventory?.quantityOnHand}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      inventory: {
                        ...editingProduct.inventory!,
                        quantityOnHand: parseInt(e.target.value) || 0
                      }
                    })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Pricing</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="priceDay" className="text-xs">Per Day</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="priceDay"
                        className="pl-9"
                        type="number"
                        value={editingProduct.pricing?.pricePerDay}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          pricing: {
                            ...editingProduct.pricing!,
                            pricePerDay: parseInt(e.target.value) || 0,
                            pricePerWeek: editingProduct.pricing?.pricePerWeek || 0,
                            pricePerMonth: editingProduct.pricing?.pricePerMonth || 0
                          }
                        })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="priceWeek" className="text-xs">Per Week</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="priceWeek"
                        className="pl-9"
                        type="number"
                        value={editingProduct.pricing?.pricePerWeek}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          pricing: {
                            ...editingProduct.pricing!,
                            pricePerDay: editingProduct.pricing?.pricePerDay || 0,
                            pricePerWeek: parseInt(e.target.value) || 0,
                            pricePerMonth: editingProduct.pricing?.pricePerMonth || 0
                          }
                        })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="priceMonth" className="text-xs">Per Month</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="priceMonth"
                        className="pl-9"
                        type="number"
                        value={editingProduct.pricing?.pricePerMonth}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          pricing: {
                            ...editingProduct.pricing!,
                            pricePerDay: editingProduct.pricing?.pricePerDay || 0,
                            pricePerWeek: editingProduct.pricing?.pricePerWeek || 0,
                            pricePerMonth: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              <span className="font-semibold"> {deletingProduct?.name}</span> and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
