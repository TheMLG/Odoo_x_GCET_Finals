import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { Product } from "@/types/rental";
import { motion } from "framer-motion";
import {
  Calendar,
  CalendarDays,
  Clock,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const formatPrice = (price: number) => {
    if (!price || price === 0) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please login to use wishlist", {
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    if (inWishlist) {
      await removeItem(product.id);
      toast.success("Removed from wishlist");
    } else {
      await addItem(product);
      toast.success("Added to wishlist");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
    >
      <Card className="group h-full overflow-hidden rounded-2xl border-2 border-border/50 bg-card shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
        <Link to={`/products/${product.id}`}>
          <div className="relative p-3">
            <motion.div 
              className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
              {product.quantityOnHand < 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge
                    variant="destructive"
                    className="absolute right-3 top-3 rounded-lg font-semibold"
                  >
                    Only {product.quantityOnHand} left
                  </Badge>
                </motion.div>
              )}
              {/* Wishlist Button */}
              <motion.button
                onClick={handleWishlistToggle}
                className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  animate={inWishlist ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-colors",
                      inWishlist ? "fill-pink-500 text-pink-500" : "text-gray-600 hover:text-red-600",
                    )}
                  />
                </motion.div>
              </motion.button>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>
        </Link>

        <CardContent className="p-4">
          <motion.div 
            className="mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <Badge variant="secondary" className="rounded-lg text-xs font-semibold">
              {product.category}
            </Badge>
          </motion.div>
          <Link to={`/products/${product.id}`}>
            <motion.h3 
              className="mb-2 line-clamp-1 text-lg font-bold transition-colors hover:text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              {product.name}
            </motion.h3>
          </Link>
          <motion.p 
            className="mb-4 h-10 line-clamp-2 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
          >
            {product.description}
          </motion.p>

          {/* Pricing Grid */}
          <motion.div 
            className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="font-medium">Hour</span>
              </div>
              <p className="text-sm font-bold">
                {formatPrice(product.pricePerHour)}
              </p>
            </div>
            <div className="border-x border-border text-center">
              <div className="mb-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">Day</span>
              </div>
              <p className="text-sm font-bold">
                {formatPrice(product.pricePerDay)}
              </p>
            </div>
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                <span className="font-medium">Week</span>
              </div>
              {/* Show vendor-set weekly price if available, otherwise calculate from daily price */}
              <p className="text-sm font-bold">
                {formatPrice(
                  product.pricePerWeek && product.pricePerWeek > 0 ?
                    product.pricePerWeek
                    : product.pricePerDay * 7,
                )}
              </p>
            </div>
          </motion.div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <motion.div 
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.6 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button asChild className="w-full rounded-lg font-semibold shadow-md transition-all hover:shadow-lg" size="lg">
              <Link to={`/products/${product.id}`}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Rent Now
              </Link>
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
