import { useState } from 'react';
import { format, addDays, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon, X, Zap, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DateSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (deliveryDate: Date, pickupDate: Date) => void;
  initialDeliveryDate?: Date;
  initialPickupDate?: Date;
}

export function DateSelectionModal({
  open,
  onClose,
  onConfirm,
  initialDeliveryDate,
  initialPickupDate,
}: DateSelectionModalProps) {
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    initialDeliveryDate || addDays(new Date(), 10)
  );
  const [pickupDate, setPickupDate] = useState<Date | undefined>(
    initialPickupDate || addDays(new Date(), 13)
  );

  const rentalDays = deliveryDate && pickupDate ? differenceInDays(pickupDate, deliveryDate) : 0;
  const chargeablePeriod =
    deliveryDate && pickupDate
      ? `${format(deliveryDate, 'do MMM')} - ${format(pickupDate, 'do MMM')}`
      : '';

  const handleContinue = () => {
    if (deliveryDate && pickupDate) {
      onConfirm(deliveryDate, pickupDate);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Select your Dates</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[400px_1fr]">
          {/* Left Section */}
          <div className="space-y-6">
            {/* Date Inputs */}
            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Delivery Date <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {deliveryDate ? format(deliveryDate, 'MMM dd, yyyy') : 'Select date'}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Pickup Date <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {pickupDate ? format(pickupDate, 'MMM dd, yyyy') : 'Select date'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="flex gap-3 rounded-xl bg-blue-50 p-4">
              <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <p className="text-sm">
                <span className="font-medium text-blue-900">
                  Same-day delivery between 3PM and 10PM
                </span>{' '}
                <span className="text-blue-700">
                  For future dates, you can select a specific time slot available at checkout. We
                  pickup between 9AM to 1PM.
                </span>
              </p>
            </div>

            {/* Rental Period */}
            <div className="rounded-xl border border-border bg-white p-6">
              <div className="mb-2 text-sm text-muted-foreground">Your Rental Period:</div>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-5xl font-bold">{String(rentalDays).padStart(2, '0')}</span>
                <span className="text-xl font-medium text-muted-foreground">Days</span>
              </div>
              {chargeablePeriod && (
                <div className="mt-4">
                  <div className="text-sm font-medium">Chargeable Period:</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{chargeablePeriod}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Promo Banner */}
            <div className="rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 p-4 shadow-lg">
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-6 w-6 fill-white text-white" />
                <span className="text-xl font-bold italic text-white">Save more with us!</span>
              </div>
              <p className="text-sm text-white">
                Longer rental periods mean bigger savings—enjoy discounts of up to 12%. We don't
                charge you for deliver and pickup days!
              </p>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={!deliveryDate || !pickupDate}
              className="w-full rounded-xl bg-blue-600 py-6 text-lg font-semibold hover:bg-blue-700"
              size="lg"
            >
              Continue
            </Button>
          </div>

          {/* Right Section - Calendar */}
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="grid gap-4">
              <Calendar
                mode="single"
                selected={deliveryDate}
                onSelect={setDeliveryDate}
                disabled={(date) => date < new Date()}
                className="rounded-xl border-0"
                classNames={{
                  months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                  month: 'space-y-4',
                  caption: 'flex justify-center pt-1 relative items-center',
                  caption_label: 'text-lg font-bold',
                  nav: 'space-x-1 flex items-center',
                  nav_button: cn(
                    'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
                  ),
                  nav_button_previous: 'absolute left-1',
                  nav_button_next: 'absolute right-1',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell: 'text-muted-foreground rounded-md w-12 font-normal text-sm',
                  row: 'flex w-full mt-2',
                  cell: cn(
                    'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent',
                    'first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
                  ),
                  day: cn(
                    'h-12 w-12 p-0 font-normal aria-selected:opacity-100',
                    'hover:bg-lime-100 hover:text-lime-900 rounded-md'
                  ),
                  day_selected:
                    'bg-lime-400 text-lime-900 hover:bg-lime-400 hover:text-lime-900 focus:bg-lime-400 focus:text-lime-900 font-bold',
                  day_today: 'bg-accent text-accent-foreground',
                  day_outside: 'text-muted-foreground opacity-50',
                  day_disabled: 'text-muted-foreground opacity-50',
                  day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                  day_hidden: 'invisible',
                }}
              />
              <div className="border-t border-border pt-4">
                <div className="text-sm font-medium">Pickup Date</div>
                <Calendar
                  mode="single"
                  selected={pickupDate}
                  onSelect={setPickupDate}
                  disabled={(date) => date < (deliveryDate || new Date())}
                  className="rounded-xl border-0"
                  classNames={{
                    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                    month: 'space-y-4',
                    caption: 'flex justify-center pt-1 relative items-center',
                    caption_label: 'text-lg font-bold',
                    nav: 'space-x-1 flex items-center',
                    nav_button: cn(
                      'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
                    ),
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex',
                    head_cell: 'text-muted-foreground rounded-md w-12 font-normal text-sm',
                    row: 'flex w-full mt-2',
                    cell: cn(
                      'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent',
                      'first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
                    ),
                    day: cn(
                      'h-12 w-12 p-0 font-normal aria-selected:opacity-100',
                      'hover:bg-lime-100 hover:text-lime-900 rounded-md'
                    ),
                    day_selected:
                      'bg-lime-400 text-lime-900 hover:bg-lime-400 hover:text-lime-900 focus:bg-lime-400 focus:text-lime-900 font-bold',
                    day_today: 'bg-accent text-accent-foreground',
                    day_outside: 'text-muted-foreground opacity-50',
                    day_disabled: 'text-muted-foreground opacity-50',
                    day_range_middle:
                      'aria-selected:bg-accent aria-selected:text-accent-foreground',
                    day_hidden: 'invisible',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
