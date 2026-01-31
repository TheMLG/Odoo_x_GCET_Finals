import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatusBadgeProps {
  icon: LucideIcon;
  label: string;
  variant?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'pink' | 'cyan';
  className?: string;
}

const variantStyles = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
};

export function StatusBadge({ icon: Icon, label, variant = 'blue', className }: StatusBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm',
        variantStyles[variant],
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}

interface InfoPillProps {
  icon: LucideIcon;
  label: string;
  value: string;
  variant?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'pink' | 'cyan';
}

export function InfoPill({ icon: Icon, label, value, variant = 'blue' }: InfoPillProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl p-4 backdrop-blur-sm',
        variantStyles[variant]
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs font-medium opacity-80">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </div>
  );
}
