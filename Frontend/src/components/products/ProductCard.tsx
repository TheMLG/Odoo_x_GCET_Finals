import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Calendar, CalendarDays, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types/rental';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      await removeItem(product.id);
      toast.success('Removed from wishlist');
    } else {
      await addItem(product);
      toast.success('Added to wishlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="group h-full overflow-hidden rounded-2xl border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <Link to={`/products/${product.id}`}>
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.quantityOnHand < 3 && (
              <Badge 
                variant="destructive" 
                className="absolute right-3 top-3 rounded-lg"
              >
                Only {product.quantityOnHand} left
              </Badge>
            )}
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transition-colors",
                  inWishlist ? "fill-pink-500 text-pink-500" : "text-gray-600"
                )}
              />
            </button>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </Link>

        <CardContent className="p-4">
          <div className="mb-2">
            <Badge variant="secondary" className="rounded-lg text-xs">
              {product.category}
            </Badge>
          </div>
          <Link to={`/products/${product.id}`}>
            <h3 className="mb-2 line-clamp-1 text-lg font-semibold transition-colors hover:text-primary">
              {product.name}
            </h3>
          </Link>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>

          {/* Pricing Grid */}
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3">
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Hour
              </div>
              <p className="text-sm font-semibold">{formatPrice(product.pricePerHour)}</p>
            </div>
            <div className="border-x border-border text-center">
              <div className="mb-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Day
              </div>
              <p className="text-sm font-semibold">{formatPrice(product.pricePerDay)}</p>
            </div>
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                Week
              </div>
              <p className="text-sm font-semibold">{formatPrice(product.pricePerWeek)}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full rounded-xl" size="lg">
            <Link to={`/products/${product.id}`}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Rent Now
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
