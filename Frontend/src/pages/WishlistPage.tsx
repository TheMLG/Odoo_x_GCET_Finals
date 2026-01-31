import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useState } from 'react';
import { DatePickerDialog } from '@/components/DatePickerDialog';
import { RentalDuration } from '@/types/rental';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleAddToCart = (productId: string) => {
    setSelectedProduct(productId);
    setIsDatePickerOpen(true);
  };

  const handleDateSelect = (
    startDate: Date,
    duration: RentalDuration,
    quantity: number
  ) => {
    const product = items.find((item) => item.id === selectedProduct);
    if (product) {
      addToCart(product, quantity, duration, startDate);
      toast.success('Added to cart!');
      setIsDatePickerOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeItem(productId);
    toast.success('Removed from wishlist');
  };

  const handleClearWishlist = () => {
    clearWishlist();
    toast.success('Wishlist cleared');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your wishlist
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearWishlist}
              className="rounded-xl"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        {/* Wishlist Items */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Your wishlist is empty</h2>
            <p className="mb-6 text-muted-foreground">
              Browse products and add items to your wishlist
            </p>
            <Button asChild className="rounded-xl">
              <Link to="/products">
                <Package className="mr-2 h-4 w-4" />
                Browse Products
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden rounded-xl border-2 transition-all hover:border-primary hover:shadow-lg">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <Link to={`/products/${product.id}`} className="relative block aspect-square overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="mb-1 font-semibold line-clamp-1 hover:text-primary">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>

                      {/* Pricing */}
                      <div className="mb-4 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Hourly</span>
                          <span className="font-semibold">₹{product.pricePerHour}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Daily</span>
                          <span className="font-semibold">₹{product.pricePerDay}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Weekly</span>
                          <span className="font-semibold">₹{product.pricePerWeek}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAddToCart(product.id)}
                          className="flex-1 rounded-xl"
                          size="sm"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                        <Button
                          onClick={() => handleRemoveFromWishlist(product.id)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Date Picker Dialog */}
      {selectedProduct && items.find((item) => item.id === selectedProduct) && (
        <DatePickerDialog
          open={isDatePickerOpen}
          onClose={() => {
            setIsDatePickerOpen(false);
            setSelectedProduct(null);
          }}
          onSelect={handleDateSelect}
          product={items.find((item) => item.id === selectedProduct)!}
        />
      )}
    </div>
  );
}
