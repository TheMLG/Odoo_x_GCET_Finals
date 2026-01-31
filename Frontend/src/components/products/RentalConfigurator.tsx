import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Minus, Plus, ShoppingCart } from 'lucide-react';
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
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RentalConfiguratorProps {
  product: Product;
}

export function RentalConfigurator({ product }: RentalConfiguratorProps) {
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState<RentalDuration>('daily');
  const [startDate, setStartDate] = useState<Date>();
  const { addItem } = useCartStore();

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

  const handleAddToCart = () => {
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }

    if (quantity > product.quantityOnHand) {
      toast.error(`Only ${product.quantityOnHand} units available`);
      return;
    }

    addItem(product, quantity, duration, startDate);
    toast.success('Added to cart!', {
      description: `${product.name} x${quantity} - ${duration}`,
    });
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
      className="space-y-6 rounded-2xl border border-border bg-card p-6"
    >
      <div>
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <p className="mt-1 text-muted-foreground">{product.category}</p>
      </div>

      {/* Duration Selection */}
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

      {/* Start Date */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start rounded-xl text-left font-normal',
                !startDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, 'PPP') : 'Select start date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              disabled={(date) => date < new Date()}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
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

      {/* Total */}
      <div className="rounded-xl bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          + GST applicable at checkout
        </p>
      </div>

      {/* Add to Cart */}
      <Button
        size="lg"
        className="w-full rounded-xl"
        onClick={handleAddToCart}
        disabled={!startDate || quantity > product.quantityOnHand}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add to Cart
      </Button>
    </motion.div>
  );
}
