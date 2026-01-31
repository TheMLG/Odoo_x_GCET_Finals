import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Trash2, Minus, Plus, X, ChevronDown, Tag, Zap, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/stores/cartStore';
import { useRentalStore } from '@/stores/rentalStore';
import { DatePickerDialog } from '@/components/DatePickerDialog';
import { toast } from 'sonner';

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CartSheet({ open, onClose }: CartSheetProps) {
  const navigate = useNavigate();
  const { items, removeItem, updateItem, getTotalAmount } = useCartStore();
  const { deliveryDate, pickupDate } = useRentalStore();
  const [showDateModal, setShowDateModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [showCoupons, setShowCoupons] = useState(false);

  // Default dates for display
  const defaultDeliveryDate = deliveryDate || new Date(2026, 1, 10); // Feb 10, 2026
  const defaultPickupDate = pickupDate || new Date(2026, 1, 13); // Feb 13, 2026

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number, maxQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxQuantity) {
      toast.error(`Only ${maxQuantity} units available`);
      return;
    }

    const item = items.find((i) => i.id === itemId);
    if (item) {
      const pricePerUnit = item.totalPrice / item.quantity;
      updateItem(itemId, {
        quantity: newQuantity,
        totalPrice: pricePerUnit * newQuantity,
      });
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const totalAmount = getTotalAmount();

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">Cart Items</SheetTitle>
            <div className="text-sm text-muted-foreground">
              {items.length} item{items.length !== 1 ? 's' : ''} added
            </div>
          </SheetHeader>

          <div className="mt-6 flex flex-col gap-6">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {items.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <Button asChild className="mt-4" onClick={onClose}>
                    <Link to="/products">Browse Products</Link>
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-xl border border-border p-4">
                    <Link
                      to={`/products/${item.productId}`}
                      onClick={onClose}
                      className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <Link
                            to={`/products/${item.productId}`}
                            onClick={onClose}
                            className="font-semibold hover:text-primary"
                          >
                            {item.product.name}
                          </Link>
                          <div className="text-sm text-muted-foreground">
                            {item.product.category}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            Rent for 2 days
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatPrice(item.totalPrice)}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.quantity - 1,
                                item.product.quantityOnHand
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.quantity + 1,
                                item.product.quantityOnHand
                              )
                            }
                            disabled={item.quantity >= item.product.quantityOnHand}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => {
                            removeItem(item.id);
                            toast.success('Item removed');
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <>
                {/* Dates Section */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Delivery Date:</span>
                      <span>{format(defaultDeliveryDate, 'do MMM')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Pickup Date:</span>
                      <span>{format(defaultPickupDate, 'do MMM')}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto rounded-full bg-black text-white hover:bg-black/90"
                      onClick={() => setShowDateModal(true)}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                    <Zap className="h-4 w-4 fill-emerald-600" />
                    <span>Additional day at ₹108 only on this cart</span>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="rounded-xl pr-10"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => toast.info('Coupon applied!')}
                    >
                      Apply
                    </Button>
                  </div>
                  <button
                    onClick={() => setShowCoupons(!showCoupons)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    View Coupons
                    <ChevronDown className={`h-4 w-4 transition-transform ${showCoupons ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Total Section */}
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">Total Charges</div>
                      <div className="text-xs text-muted-foreground">Price incl. of all taxes</div>
                    </div>
                    <div className="text-2xl font-bold">{formatPrice(totalAmount)}</div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full rounded-xl bg-blue-600 py-6 text-lg font-semibold hover:bg-blue-700"
                    size="lg"
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Go to Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <DatePickerDialog
        open={showDateModal}
        onClose={() => setShowDateModal(false)}
      />
    </>
  );
}
