import { MainLayout } from "@/components/layout/MainLayout";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { FilterSidebar } from "@/components/products/FilterSidebar";
import { WelcomeCouponDialog } from "@/components/coupon/WelcomeCouponDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRentalStore } from "@/stores/rentalStore";

import { motion } from "framer-motion";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function ProductsPage() {
  const { products, isLoadingProducts, productsError, fetchProducts } = useRentalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");

  // Sidebar filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Show error toast if fetching fails
  useEffect(() => {
    if (productsError) {
      toast.error('Failed to load products', {
        description: productsError,
      });
    }
  }, [productsError]);

  // Extract unique brands from products
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((product) => {
      if (product.attributes?.brand) {
        brands.add(product.attributes.brand);
      }
    });
    return Array.from(brands).sort();
  }, [products]);

  // Count active filters
  const activeFilterCount = selectedBrands.length + selectedColors.length + selectedDurations.length +
    (priceRange[0] !== 0 || priceRange[1] !== 10000 ? 1 : 0);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isPublished);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((p) =>
        p.attributes?.brand && selectedBrands.includes(p.attributes.brand)
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.attributes?.color && selectedColors.includes(p.attributes.color.toLowerCase())
      );
    }

    // Duration filter (this can be customized based on your rental duration logic)
    if (selectedDurations.length > 0) {
      result = result.filter((p) => {
        // You can add logic here if products have duration attributes
        return true; // For now, showing all products
      });
    }

    // Price range filter
    result = result.filter((p) =>
      p.pricePerDay >= priceRange[0] && p.pricePerDay <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case "price-low":
        result = [...result].sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      default:
        // featured - keep original order
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategories, sortBy, selectedBrands, selectedColors, selectedDurations, priceRange]);

  return (
    <MainLayout>
      <WelcomeCouponDialog />
      <div className="container px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">
            Rental Products
          </h1>
          <p className="text-muted-foreground">
            Browse our extensive collection of professional equipment available
            for rent
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProductFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>

            {/* Mobile Sidebar Filters Button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-xl lg:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  More Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <FilterSidebar
                  selectedBrands={selectedBrands}
                  onBrandChange={setSelectedBrands}
                  selectedColors={selectedColors}
                  onColorChange={setSelectedColors}
                  selectedDurations={selectedDurations}
                  onDurationChange={setSelectedDurations}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  availableBrands={availableBrands}
                />
              </SheetContent>
            </Sheet>
          </div>
        </motion.div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden w-full lg:block lg:w-64 xl:w-72"
          >
            <div className="sticky top-6">
              <FilterSidebar
                selectedBrands={selectedBrands}
                onBrandChange={setSelectedBrands}
                selectedColors={selectedColors}
                onColorChange={setSelectedColors}
                selectedDurations={selectedDurations}
                onDurationChange={setSelectedDurations}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                availableBrands={availableBrands}
              />
            </div>
          </motion.aside>

          {/* Products Section */}
          <div className="flex-1">
            {/* Results count */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6 text-sm text-muted-foreground"
            >
              Showing {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""}
            </motion.p>

            {/* Loading state */}
            {isLoadingProducts ?
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Loading products...
                </span>
              </div>
              : <>
                {/* Products Grid */}
                {filteredProducts.length > 0 ?
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                      />
                    ))}
                  </div>
                  : <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      No products found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </motion.div>
                }
              </>
            }
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
