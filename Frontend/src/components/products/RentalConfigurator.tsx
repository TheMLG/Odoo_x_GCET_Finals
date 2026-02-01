import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Minus, Plus, ShoppingCart, TrendingUp, Shield, Heart, ChevronRight, Tag, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { Product, RentalDuration } from '@/types/rental';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { useRentalStore } from '@/stores/rentalStore';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { DatePickerDialog } from '@/components/DatePickerDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import * as couponApi from '@/lib/couponApi';
import type { Coupon } from '@/lib/couponApi';

interface RentalConfiguratorProps {
  product: Product;
}

export function RentalConfigurator({ product }: RentalConfiguratorProps) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState<RentalDuration>('daily');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCartStore();
  const { deliveryDate, pickupDate } = useRentalStore();
  const { isAuthenticated } = useAuthStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  const formatPrice = (price: number) => {
    if (!price || price === 0) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPriceForDuration = () => {
    switch (duration) {
      case 'hourly':
        return product.pricePerHour;
      case 'daily':
        return product.pricePerDay;
      case 'weekly':
        return product.pricePerWeek;
      default:
        return product.pricePerDay;
    }
  };

  const totalPrice = getPriceForDuration() * quantity;

  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoadingCoupons(true);
        const data = await couponApi.getAvailableCoupons();
        setCoupons(data);
      } catch (error) {
        console.error('Failed to fetch coupons:', error);
      } finally {
        setIsLoadingCoupons(false);
      }
    };

    if (isAuthenticated) {
      fetchCoupons();
    }
  }, [isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login'),
        },
      });
      return;
    }

    if (!deliveryDate || !pickupDate) {
      toast.error('Please select delivery and pickup dates');
      return;
    }

    if (quantity > product.quantityOnHand) {
      toast.error(`Only ${product.quantityOnHand} units available`);
      return;
    }

    const currentPrice = getPriceForDuration();
    if (!currentPrice || currentPrice === 0) {
      toast.error(`${duration} rental is not available for this product`);
      return;
    }

    try {
      setIsAddingToCart(true);
      // Pass pickupDate as endDate
      await addItem(product, quantity, duration, deliveryDate, pickupDate || undefined);
      toast.success('Added to cart!', {
        description: `${product.name} x${quantity} - ${duration}`,
      });
    } catch (error) {
      // Error toast is already shown in the store
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to use wishlist', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
      return;
    }

    if (inWishlist) {
      await removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      await addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const durationOptions = [
    { value: 'hourly', label: 'Hourly', price: product.pricePerHour, icon: Clock },
    { value: 'daily', label: 'Daily', price: product.pricePerDay, icon: CalendarIcon },
    { value: 'weekly', label: 'Weekly', price: product.pricePerWeek, icon: CalendarIcon },
  ].filter(option => option.price && option.price > 0); // Only show available pricing options

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Product Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.description}</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">210 booked this month</span>
          </div>
        </div>
        <button
          onClick={handleWishlistToggle}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
        >
          <Heart className={cn(
            "h-5 w-5 transition-colors",
            inWishlist ? "fill-pink-500 text-pink-500" : "text-gray-600"
          )} />
        </button>
      </div>

      {/* Rental Duration & Price */}
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Rent for {duration === 'daily' ? '2 days' : duration === 'weekly' ? '1 week' : '4 hours'}</div>
        <div className="text-4xl font-bold">{formatPrice(totalPrice)}</div>
        <div className="flex items-center gap-1.5 text-sm text-pink-600 font-medium">
          <Tag className="h-4 w-4" />
          Additional day at {'\u20B9'}108 only
        </div>
        <div className="text-xs text-muted-foreground">Price incl. of all taxes</div>
      </div>

      {/* Select Usage Dates Section */}
      {deliveryDate && pickupDate ? (
        <div className="space-y-4 rounded-xl border border-border bg-gradient-to-br from-green-50 to-emerald-50 p-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Your Rental Dates</h3>

          {/* Delivery Date */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Delivery Date *</label>
            <div className="flex items-center gap-3 rounded-lg bg-green-500 px-4 py-3 text-white">
              <CalendarIcon className="h-5 w-5" />
              <span className="font-semibold">{format(deliveryDate, 'MMM dd, yyyy')}</span>
            </div>
          </div>

          {/* Pickup Date */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pickup Date *</label>
            <div className="flex items-center gap-3 rounded-lg bg-white border-2 border-gray-200 px-4 py-3 text-gray-900">
              <CalendarIcon className="h-5 w-5" />
              <span className="font-semibold">{format(pickupDate, 'MMM dd, yyyy')}</span>
            </div>
          </div>

          {/* Rental Period */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Your Rental Period</label>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-purple-600">
                {Math.ceil((pickupDate.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)).toString().padStart(2, '0')}
              </span>
              <span className="text-lg text-gray-600">Days</span>
            </div>
          </div>

          {/* Chargeable Period */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Chargeable Period</label>
            <div className="flex items-center gap-2 text-purple-600">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {format(deliveryDate, 'do MMM')} - {format(pickupDate, 'do MMM')}
              </span>
            </div>
          </div>

          {/* Change Dates Button */}
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => setIsDatePickerOpen(true)}
          >
            Change Dates
          </Button>
        </div>
      ) : (
        <Button
          size="lg"
          variant="outline"
          className="w-full rounded-xl border-2"
          onClick={() => setIsDatePickerOpen(true)}
        >
          <CalendarIcon className="mr-2 h-5 w-5" />
          Select Usage Dates
        </Button>
      )}

      {/* Add to Cart Button */}
      <Button
        size="lg"
        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
        onClick={handleAddToCart}
        disabled={!deliveryDate || !pickupDate || quantity > product.quantityOnHand || isAddingToCart}
      >
        {isAddingToCart ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Adding to Cart...
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </>
        )}
      </Button>

      {/* Date Picker Dialog */}
      <DatePickerDialog open={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)} />

      {/* Available Coupons */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Available Coupons {coupons.length > 0 && `(${coupons.length} ${coupons.length === 1 ? 'Coupon' : 'Coupons'})`}
          </h3>
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </div>

        {isLoadingCoupons ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading coupons...</span>
          </div>
        ) : coupons.length > 0 ? (
          <div className="space-y-3">
            {coupons.slice(0, 3).map((coupon, index) => (
              <div key={coupon.id} className="flex gap-3">
                <div className={cn(
                  "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
                  index === 0 ? "bg-emerald-100" : index === 1 ? "bg-blue-100" : "bg-purple-100"
                )}>
                  <Tag className={cn(
                    "h-5 w-5",
                    index === 0 ? "text-emerald-600" : index === 1 ? "text-blue-600" : "text-purple-600"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{coupon.code}</div>
                  <div className="text-sm text-muted-foreground">
                    {coupon.description}
                    {coupon.minOrderAmount && ` Min order: ₹${coupon.minOrderAmount}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {isAuthenticated ? 'No coupons available at the moment' : 'Login to view available coupons'}
          </div>
        )}
      </div>

    </motion.div>
  );
}
