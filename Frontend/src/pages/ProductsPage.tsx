import { MainLayout } from "@/components/layout/MainLayout";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { useRentalStore } from "@/stores/rentalStore";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function ProductsPage() {
  const { products, isLoadingProducts, productsError, fetchProducts } = useRentalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string[]>
  >({});
  const [sortBy, setSortBy] = useState("featured");

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

  const attributeFilters = useMemo(() => {
    const map = new Map<string, Set<string>>();

    products.forEach((product) => {
      const activeVariants = (product.variants || []).filter(
        (v) => v.isActive !== false,
      );

      const schema =
        product.attributeSchema && product.attributeSchema.length > 0 ?
          product.attributeSchema
        : activeVariants.length > 0 ?
          Object.keys(activeVariants[0].attributes || {}).map((name) => ({
            name,
            options: Array.from(
              new Set(
                activeVariants
                  .map((v) => v.attributes?.[name])
                  .filter(Boolean),
              ),
            ),
          }))
        : [];

      schema.forEach((attr) => {
        if (!map.has(attr.name)) {
          map.set(attr.name, new Set());
        }
        const set = map.get(attr.name)!;
        attr.options.forEach((opt) => set.add(opt));
      });
    });

    return Array.from(map.entries()).map(([name, options]) => ({
      name,
      options: Array.from(options),
    }));
  }, [products]);

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

    const activeAttributeFilters = Object.entries(selectedAttributes).filter(
      ([, values]) => values.length > 0,
    );

    if (activeAttributeFilters.length > 0) {
      result = result.filter((product) => {
        const activeVariants = (product.variants || []).filter(
          (v) => v.isActive !== false,
        );
        if (activeVariants.length === 0) return false;

        return activeVariants.some((variant) =>
          activeAttributeFilters.every(([attrName, values]) =>
            values.includes(variant.attributes?.[attrName]),
          ),
        );
      });
    }

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
  }, [products, searchQuery, selectedCategories, selectedAttributes, sortBy]);

  return (
    <MainLayout>

      <div className="container px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-12"
        >
          <motion.h1 
            className="mb-4 text-5xl font-bold text-foreground md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Rental <span className="text-primary">Products</span>
          </motion.h1>
          <motion.p 
            className="text-base text-muted-foreground md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Browse our extensive collection of professional equipment available for rent. High quality, fully insured, and ready for your project.
          </motion.p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-10"
        >
          <ProductFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            attributeFilters={attributeFilters}
            selectedAttributes={selectedAttributes}
            onAttributeChange={(name, values) =>
              setSelectedAttributes((prev) => ({
                ...prev,
                [name]: values,
              }))
            }
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </motion.div>

        {/* Products Section */}
        <div>
          {/* Results count */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-8 flex items-center gap-3"
          >
            <div className="h-1 w-12 rounded-full bg-primary" />
            <p className="text-base font-semibold text-foreground">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </motion.div>

          {/* Loading state */}
          {isLoadingProducts ?
            <motion.div 
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-12 w-12 text-primary" />
              </motion.div>
              <span className="mt-4 text-base font-medium text-muted-foreground">
                Loading products...
              </span>
            </motion.div>
            : <>
              {/* Products Grid */}
              {filteredProducts.length > 0 ?
                <motion.div 
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </motion.div>
                : <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <motion.div 
                    className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <span className="text-4xl">🔍</span>
                  </motion.div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">
                    No products found
                  </h3>
                  <p className="text-base text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </motion.div>
              }
            </>
          }
        </div>
      </div>
    </MainLayout>
  );
}
