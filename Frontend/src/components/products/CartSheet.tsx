import { DatePickerDialog } from "@/components/DatePickerDialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import { useRentalStore } from "@/stores/rentalStore";
import { format } from "date-fns";
import { Calendar, Minus, Plus, ShoppingBag, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CartSheet({ open, onClose }: CartSheetProps) {
  const navigate = useNavigate();
  const { items, removeItem, updateItem, getTotalAmount } = useCartStore();
  const { deliveryDate, pickupDate } = useRentalStore();
  const [showDateModal, setShowDateModal] = useState(false);

  // Default dates for display
  const defaultDeliveryDate = deliveryDate || new Date(2026, 1, 10); // Feb 10, 2026
  const defaultPickupDate = pickupDate || new Date(2026, 1, 13); // Feb 13, 2026

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (
    itemId: string,
    newQuantity: number,
    maxQuantity: number,
  ) => {
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
    navigate("/checkout/contact");
  };

  const totalAmount = getTotalAmount();
  const baseAmount = totalAmount / 1.18;
  const gstAmount = totalAmount - baseAmount;

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader className="pb-3">
            <SheetTitle className="text-xl font-bold">Cart Items</SheetTitle>
            <div className="text-xs text-muted-foreground">
              {items.length} item{items.length !== 1 ? "s" : ""} added
            </div>
          </SheetHeader>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-100px)] pr-1">
            {/* Cart Items */}
            <div className="flex-1 space-y-3">
              {items.length === 0 ?
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <Button asChild className="mt-4" onClick={onClose}>
                    <Link to="/products">Browse Products</Link>
                  </Button>
                </div>
              : items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-lg border border-border p-3"
                  >
                    <Link
                      to={`/products/${item.productId}`}
                      onClick={onClose}
                      className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <div className="mb-1.5 flex items-start justify-between">
                        <div>
                          <Link
                            to={`/products/${item.productId}`}
                            onClick={onClose}
                            className="text-sm font-semibold hover:text-primary line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">
                            {item.product.category} • Rent for 2 days
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {formatPrice(item.totalPrice)}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            +GST{" "}
                            {formatPrice(
                              item.totalPrice - item.totalPrice / 1.18,
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.quantity - 1,
                                item.product.quantityOnHand,
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.quantity + 1,
                                item.product.quantityOnHand,
                              )
                            }
                            disabled={
                              item.quantity >= item.product.quantityOnHand
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => {
                            removeItem(item.id);
                            toast.success("Item removed");
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>

            {items.length > 0 && (
              <>
                {/* Dates Section */}
                <div className="space-y-2 border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">Delivery:</span>
                        <span className="text-muted-foreground">
                          {format(defaultDeliveryDate, "do MMM")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">Pickup:</span>
                        <span className="text-muted-foreground">
                          {format(defaultPickupDate, "do MMM")}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-full bg-black px-3 text-xs text-white hover:bg-black/90"
                      onClick={() => setShowDateModal(true)}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600">
                    <Zap className="h-3.5 w-3.5 fill-emerald-600" />
                    <span>
                      Additional day at {"\u20B9"}108 only on this cart
                    </span>
                  </div>
                </div>

                {/* Total Section */}
                <div className="space-y-3 border-t border-border pt-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Base Amount</span>
                      <span className="font-medium">
                        {formatPrice(baseAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span className="font-medium">
                        {formatPrice(gstAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <div>
                        <div className="text-sm font-bold">Total Charges</div>
                        <div className="text-[10px] text-muted-foreground">
                          Price incl. of all taxes
                        </div>
                      </div>
                      <div className="text-xl font-bold">
                        {formatPrice(totalAmount)}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full rounded-lg bg-blue-600 py-5 text-base font-semibold hover:bg-blue-700"
                    size="lg"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
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
