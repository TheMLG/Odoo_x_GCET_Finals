import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { CouponSelector } from '@/components/coupon/CouponSelector';
import { WelcomeCouponDialog } from '@/components/coupon/WelcomeCouponDialog';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateItem, getTotalAmount, clearCart, fetchCart, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Fetch cart on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // item.totalPrice already includes GST in the store
  const total = getTotalAmount();
  const discountAmount = appliedCoupon?.discount || 0;
  const totalAfterDiscount = total - discountAmount;
  const baseAmount = totalAfterDiscount / 1.18;
  const gstAmount = totalAfterDiscount - baseAmount;

  const handleCouponApplied = (code: string, discount: number) => {
    if (code && discount > 0) {
      setAppliedCoupon({ code, discount });
    } else {
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please login to continue', {
        description: 'You need to be logged in to checkout',
      });
      navigate('/login');
      return;
    }
    navigate('/checkout/contact');
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

  if (items.length === 0) {
    return (
      <MainLayout>
        <WelcomeCouponDialog />
        <div className="container flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
            <p className="mb-6 text-muted-foreground">
              Browse our products and add items to your cart
            </p>
            <Button asChild className="rounded-xl">
              <Link to="/products">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <WelcomeCouponDialog />
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {items.length} item{items.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              clearCart();
              toast.success('Cart cleared');
            }}
            className="text-destructive hover:text-destructive"
          >
            Clear Cart
          </Button>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link
                        to={`/products/${item.productId}`}
                        className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            to={`/products/${item.productId}`}
                            className="font-semibold hover:text-primary"
                          >
                            {item.product.name}
                          </Link>
                          <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span className="capitalize">{item.rentalDuration} rental</span>
                            <span>•</span>
                            <span>
                              {format(new Date(item.startDate), 'MMM dd')} -{' '}
                              {format(new Date(item.endDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
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
                              className="h-8 w-8 rounded-lg"
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

                          {/* Price & Remove */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="block font-semibold">{formatPrice(item.totalPrice)}</span>
                              <span className="text-xs text-muted-foreground">
                                Base: {formatPrice(item.totalPrice / 1.18)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                + GST: {formatPrice(item.totalPrice - (item.totalPrice / 1.18))}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
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
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="sticky top-24 rounded-2xl">
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

                {/* Coupon Selector */}
                <div className="mb-4">
                  <CouponSelector
                    totalAmount={total}
                    onCouponApplied={handleCouponApplied}
                    appliedCouponCode={appliedCoupon?.code}
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span>{formatPrice(baseAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>{formatPrice(gstAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span className="text-lg text-primary">{formatPrice(totalAfterDiscount)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="mt-6 w-full rounded-xl"
                  size="lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Security deposit may be required at checkout
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
