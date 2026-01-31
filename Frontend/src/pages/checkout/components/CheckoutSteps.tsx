import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  name: string;
}

const steps: Step[] = [
  { id: 1, name: 'Contact Details' },
  { id: 2, name: 'Address' },
  { id: 3, name: 'Delivery Method' },
  { id: 4, name: 'Payment' },
];

interface CheckoutStepsProps {
  currentStep: number;
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2 overflow-x-auto pb-4 md:gap-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors md:h-10 md:w-10',
                step.id === currentStep
                  ? 'bg-blue-600 text-white'
                  : step.id < currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
              )}
            >
              {step.id}
            </div>
            <span
              className={cn(
                'hidden text-sm font-medium md:inline',
                step.id === currentStep ? 'text-blue-600' : 'text-gray-600'
              )}
            >
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <ChevronRight className="mx-1 h-4 w-4 text-gray-400 md:mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}
