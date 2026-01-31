import { useState } from 'react';
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
import { DatePickerDialog } from '@/components/DatePickerDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

  const formatPrice = (price: number) => {
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

    try {
      setIsAddingToCart(true);
      await addItem(product, quantity, duration, deliveryDate);
      toast.success('Added to cart!', {
        description: `${product.name} x${quantity} - ${duration}`,
      });
    } catch (error) {
      // Error toast is already shown in the store
    } finally {
      setIsAddingToCart(false);
    }
  };

  const durationOptions = [
    { value: 'hourly', label: 'Hourly', price: product.pricePerHour, icon: Clock },
    { value: 'daily', label: 'Daily', price: product.pricePerDay, icon: CalendarIcon },
    { value: 'weekly', label: 'Weekly', price: product.pricePerWeek, icon: CalendarIcon },
  ];

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
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-muted">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Rental Duration & Price */}
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Rent for {duration === 'daily' ? '2 days' : duration === 'weekly' ? '1 week' : '4 hours'}</div>
        <div className="text-4xl font-bold">{formatPrice(totalPrice)}</div>
        <div className="flex items-center gap-1.5 text-sm text-pink-600 font-medium">
          <Tag className="h-4 w-4" />
          Additional day at ₹108 only
        </div>
        <div className="text-xs text-muted-foreground">Price incl. of all taxes</div>
      </div>

      {/* Select Usage Dates Button */}
      <Button
        size="lg"
        variant="outline"
        className="w-full rounded-xl border-2"
        onClick={() => setIsDatePickerOpen(true)}
      >
        <CalendarIcon className="mr-2 h-5 w-5" />
        {deliveryDate && pickupDate
          ? `${format(deliveryDate, 'MMM dd')} - ${format(pickupDate, 'MMM dd')}`
          : 'Select Usage Dates'}
      </Button>

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

      {/* Available Offers */}
      <div className="rounded-xl border border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Available Offers (3 Offers)</h3>
          <ChevronRight className="h-5 w-5" />
        </div>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <Tag className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium">SHAREPAL</div>
              <div className="text-sm text-muted-foreground">
                Use code SHAREPAL & get 10% off on orders above ₹1500. Maximum discount: ₹300
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium">EARLYE</div>
              <div className="text-sm text-muted-foreground">
                Use code EARLYE & get 15% off on orders above ₹2000
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Duration Selection - Collapsed for simplicity */}
      <details className="rounded-xl border border-border p-4">
        <summary className="cursor-pointer font-semibold">Rental Options</summary>
        <div className="mt-4 space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Rental Duration</Label>
            <RadioGroup
              value={duration}
              onValueChange={(value) => setDuration(value as RentalDuration)}
              className="grid grid-cols-3 gap-3"
            >
              {durationOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                    duration === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                  <option.icon className={cn(
                    'h-5 w-5',
                    duration === option.value ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className={cn(
                    'text-lg font-bold',
                    duration === option.value ? 'text-primary' : ''
                  )}>
                    {formatPrice(option.price)}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Quantity</Label>
              <span className="text-sm text-muted-foreground">
                {product.quantityOnHand} available
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                onClick={() => setQuantity(Math.min(product.quantityOnHand, quantity + 1))}
                disabled={quantity >= product.quantityOnHand}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </details>
    </motion.div>
  );
}
