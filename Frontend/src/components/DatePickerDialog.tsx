import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, X, Info } from "lucide-react";
import { format, addDays, differenceInDays, isSameDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useRentalStore } from "@/stores/rentalStore";
import { cn } from "@/lib/utils";

interface DatePickerDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DatePickerDialog({ open, onClose }: DatePickerDialogProps) {
  const { deliveryDate, pickupDate, setRentalDates } = useRentalStore();
  const [selectingFor, setSelectingFor] = useState<'delivery' | 'pickup'>('delivery');

  const [localDeliveryDate, setLocalDeliveryDate] = useState<Date | undefined>(
    deliveryDate || addDays(new Date(), 1)
  );
  const [localPickupDate, setLocalPickupDate] = useState<Date | undefined>(
    pickupDate || undefined
  );

  useEffect(() => {
    if (deliveryDate) setLocalDeliveryDate(deliveryDate);
    if (pickupDate) setLocalPickupDate(pickupDate);
  }, [deliveryDate, pickupDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (selectingFor === 'delivery') {
      setLocalDeliveryDate(date);
      // Auto-adjust pickup date if it's before or same as delivery date
      if (localPickupDate && date >= localPickupDate) {
        setLocalPickupDate(addDays(date, 1));
      }
      // Automatically switch to pickup date selection after delivery date is selected
      setSelectingFor('pickup');
    } else {
      // Only allow pickup date after delivery date
      if (localDeliveryDate && date > localDeliveryDate) {
        setLocalPickupDate(date);
      }
    }
  };

  const handleContinue = () => {
    if (localDeliveryDate && localPickupDate) {
      setRentalDates(localDeliveryDate, localPickupDate);
      onClose();
    }
  };

  const rentalDays =
    localDeliveryDate && localPickupDate
      ? differenceInDays(localPickupDate, localDeliveryDate)
      : 0;

  const chargeablePeriod =
    localDeliveryDate && localPickupDate
      ? `${format(localDeliveryDate, "do MMM")} - ${format(
          localPickupDate,
          "do MMM"
        )}`
      : "";

  const discountPercentage =
    rentalDays >= 7 ? 12 : rentalDays >= 5 ? 8 : rentalDays >= 3 ? 5 : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-semibold">
            Select your Dates
          </DialogTitle>
        </DialogHeader>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-3 auto-rows-[minmax(80px,auto)]">
          
          {/* Calendar - Large centered box (spans 6 columns, 4 rows) */}
          <div className="col-span-12 md:col-span-6 md:row-span-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-3 flex items-center justify-center">
            <Calendar
              mode="single"
              selected={selectingFor === 'delivery' ? localDeliveryDate : localPickupDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                if (selectingFor === 'delivery') {
                  return date < new Date();
                }
                return !localDeliveryDate || date <= localDeliveryDate;
              }}
              className="mx-auto"
              modifiers={{
                delivery: localDeliveryDate ? [localDeliveryDate] : [],
                pickup: localPickupDate ? [localPickupDate] : [],
              }}
              modifiersClassNames={{
                delivery: "bg-lime-400 text-gray-900 hover:bg-lime-500 font-medium",
                pickup: "bg-blue-500 text-white hover:bg-blue-600 font-medium",
              }}
            />
          </div>

          {/* Delivery Date - Top right (spans 6 columns, 1 row) */}
          <div className="col-span-12 md:col-span-6 md:row-span-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-lime-50 dark:bg-lime-950/30 p-3 hover:shadow-sm transition-all duration-200">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
              Delivery Date <span className="text-red-500">*</span>
            </label>
            <button
              onClick={() => setSelectingFor('delivery')}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-all duration-200",
                selectingFor === 'delivery' 
                  ? "bg-lime-500 text-white" 
                  : "bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="font-medium text-base">
                {localDeliveryDate
                  ? format(localDeliveryDate, "MMM dd, yyyy")
                  : "Select date"}
              </span>
            </button>
          </div>

          {/* Pickup Date - Below delivery (spans 6 columns, 1 row) */}
          <div className="col-span-12 md:col-span-6 md:row-span-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950/30 p-3 hover:shadow-sm transition-all duration-200">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
              Pickup Date <span className="text-red-500">*</span>
            </label>
            <button
              onClick={() => setSelectingFor('pickup')}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-all duration-200",
                selectingFor === 'pickup' 
                  ? "bg-blue-500 text-white" 
                  : "bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="font-medium text-base">
                {localPickupDate
                  ? format(localPickupDate, "MMM dd, yyyy")
                  : "Select date"}
              </span>
            </button>
          </div>

          {/* Rental Period Stats - Large box (spans 6 columns, 2 rows) */}
          <div className="col-span-12 md:col-span-6 md:row-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-950/30 p-4">
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Your Rental Period
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-semibold text-purple-600 dark:text-purple-400">
                    {String(rentalDays).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Day{rentalDays !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Chargeable Period
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{chargeablePeriod || "Not set"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner - Wide bottom box (spans 12 columns, 1 row) */}
          <div className="col-span-12 md:col-span-8 rounded-xl bg-blue-500 p-4">
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 bg-white/20 rounded-full p-1.5">
                <Info className="h-4 w-4 text-white" />
              </div>
              <div className="text-white">
                <p className="font-medium text-sm mb-0.5">Same-day delivery</p>
                <p className="text-xs leading-relaxed text-blue-100">
                  between 3PM and 10PM. For future dates, you can select a specific time slot available at checkout. We pickup between <span className="font-medium">9AM to 1PM</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button - Bottom right (spans 4 columns, 1 row) */}
          <div className="col-span-12 md:col-span-4 flex items-center justify-center">
            <Button
              onClick={handleContinue}
              disabled={!localDeliveryDate || !localPickupDate}
              className="px-6 py-2 rounded-lg bg-blue-600 text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
