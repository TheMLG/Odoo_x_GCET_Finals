import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { motion } from "framer-motion";
import { Heart, Package, ShoppingCart, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function WishlistPage() {
  const {
    items,
    removeItem,
    clearWishlist,
    deleteWishlist,
    fetchWishlist,
    isLoading,
    isInitialized,
  } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Fetch wishlist from backend when authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      fetchWishlist();
    }
  }, [isAuthenticated, isInitialized, fetchWishlist]);

  const handleViewProduct = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeItem(productId);
    toast.success("Removed from wishlist");
  };

  const handleClearWishlist = async () => {
    await clearWishlist();
    toast.success("Wishlist cleared");
  };

  const handleDeleteWishlist = async () => {
    await deleteWishlist();
    toast.success("Wishlist deleted completely");
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"} in your
              wishlist
            </p>
          </div>
          {items.length > 0 && (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Wishlist?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all {items.length} items from your
                      wishlist. You can add them back later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearWishlist}>
                      Clear All Items
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {isAuthenticated && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="rounded-xl">
                      <X className="mr-2 h-4 w-4" />
                      Delete Wishlist
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Wishlist?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your wishlist and all saved
                        items. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteWishlist}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        )}

        {/* Wishlist Items */}
        {!isLoading && items.length === 0 ?
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">
              Your wishlist is empty
            </h2>
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
        : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    <Link
                      to={`/products/${product.id}`}
                      className="relative block aspect-square overflow-hidden"
                    >
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
                          <span className="font-semibold">
                            ₹{product.pricePerHour}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Daily</span>
                          <span className="font-semibold">
                            ₹{product.pricePerDay}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Weekly</span>
                          <span className="font-semibold">
                            ₹{product.pricePerWeek}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewProduct(product.id)}
                          className="flex-1 rounded-xl"
                          size="sm"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          View & Rent
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove from Wishlist?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove "{product.name}"
                                from your wishlist?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleRemoveFromWishlist(product.id)
                                }
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
