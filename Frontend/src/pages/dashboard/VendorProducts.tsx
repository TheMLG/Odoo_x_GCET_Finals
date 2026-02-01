import { ProductDialog } from "@/components/vendor/ProductDialog";
import { VendorLayout } from "@/components/layout/VendorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { PRODUCT_CATEGORIES, PRODUCT_STATUS_OPTIONS } from "@/lib/constants";
import {
  deleteProduct,
  getVendorProducts,
  VendorProduct,
} from "@/lib/vendorApi";
import { motion } from "framer-motion";
import {
  Calendar,
  CalendarDays,
  Clock,
  Edit,
  Eye,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const getStatusConfig = (status: boolean, quantity: number) => {
  if (quantity === 0) {
    return { label: "Out of Stock", variant: "destructive" as const };
  }
  if (quantity <= 2) {
    return { label: "Low Stock", variant: "secondary" as const };
  }
  if (!status) {
    return { label: "Draft", variant: "secondary" as const };
  }
  return { label: "Active", variant: "default" as const };
};

const formatPrice = (price: number | string | undefined) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (!numPrice || numPrice === 0) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numPrice);
};

export default function VendorProducts() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getVendorProducts();
      console.log("Fetched products:", data);
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Implement category filtering if product object has category field
    // Assuming product object structure from API might need update or we check attributes
    const matchesCategory = categoryFilter === "all" || true; // Placeholder until category is in API response

    // Implement status filtering
    // const matchesStatus = statusFilter === "all" || ...
    const matchesStatus = true;

    return matchesSearch && matchesCategory && matchesStatus;
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
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">
              Manage your rental product inventory
            </p>
          </div>
          <ProductDialog mode="add" onProductSaved={fetchProducts} />
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
              placeholder="Search products..."
              className="pl-10 rounded-xl bg-white dark:bg-gray-950"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px] rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_STATUS_OPTIONS.map((option) => (
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
          : /* Products Grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, index) => {
              const qty = product.inventory?.totalQty || 0;
              const statusConfig = getStatusConfig(product.isPublished, qty);
              const hourPrice = product.pricing.find((p) => p.type === "HOUR")?.price;
              const dayPrice = product.pricing.find((p) => p.type === "DAY")?.price;
              const weekPrice = product.pricing.find((p) => p.type === "WEEK")?.price;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="group h-full overflow-hidden rounded-2xl border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                    {/* Product Image */}
                    <div className="relative p-3">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                        {product.product_image_url ?
                          <img
                            src={product.product_image_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          : <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ImageIcon className="h-12 w-12" />
                            <span className="text-sm">No image</span>
                          </div>
                        }
                        {qty < 3 && qty > 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute right-3 top-3 rounded-lg"
                          >
                            Only {qty} left
                          </Badge>
                        )}
                        {qty === 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute right-3 top-3 rounded-lg"
                          >
                            Out of Stock
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                    </div>

                    <CardContent className="p-4 pt-0">
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="secondary" className="rounded-lg text-xs">
                          {product.category || "Uncategorized"}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={statusConfig.variant}
                            className="rounded-lg text-xs"
                          >
                            {statusConfig.label}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg flex-shrink-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <ProductDialog
                                mode="view"
                                product={product}
                                trigger={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                }
                              />
                              <ProductDialog
                                mode="edit"
                                product={product}
                                onProductSaved={fetchProducts}
                                trigger={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                }
                              />
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <h3 className="mb-2 line-clamp-1 text-lg font-semibold">
                        {product.name}
                      </h3>
                      <p className="mb-4 h-10 line-clamp-2 text-sm text-muted-foreground">
                        {product.description || "No description available"}
                      </p>

                      {/* Pricing Grid */}
                      <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3">
                        <div className="text-center">
                          <div className="mb-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Hour
                          </div>
                          <p className="text-sm font-semibold">
                            {formatPrice(hourPrice)}
                          </p>
                        </div>
                        <div className="border-x border-border text-center">
                          <div className="mb-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Day
                          </div>
                          <p className="text-sm font-semibold">
                            {formatPrice(dayPrice)}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="mb-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            Week
                          </div>
                          <p className="text-sm font-semibold">
                            {formatPrice(
                              weekPrice && parseFloat(weekPrice) > 0
                                ? weekPrice
                                : dayPrice
                                  ? parseFloat(dayPrice) * 7
                                  : undefined
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Stock Info */}
                      <div className="mt-3 text-center">
                        <p className="text-sm text-muted-foreground">
                          {qty} in stock
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        }

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {products.length === 0 ?
                "Get started by adding your first product"
                : "Try adjusting your search or filters"}
            </p>
            <ProductDialog mode="add" onProductSaved={fetchProducts} />
          </motion.div>
        )}
      </div>
    </VendorLayout>
  );
}
