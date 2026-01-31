import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  selectedBrands: string[];
  onBrandChange: (brands: string[]) => void;
  selectedColors: string[];
  onColorChange: (colors: string[]) => void;
  selectedDurations: string[];
  onDurationChange: (durations: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  availableBrands: string[];
}

const AVAILABLE_COLORS = [
  { name: 'Blue', value: 'blue', hex: '#3B82F6' },
  { name: 'Purple', value: 'purple', hex: '#A855F7' },
  { name: 'Orange', value: 'orange', hex: '#F97316' },
  { name: 'Red', value: 'red', hex: '#EF4444' },
  { name: 'Green', value: 'green', hex: '#10B981' },
  { name: 'Yellow', value: 'yellow', hex: '#EAB308' },
  { name: 'Pink', value: 'pink', hex: '#EC4899' },
  { name: 'Teal', value: 'teal', hex: '#14B8A6' },
];

const RENTAL_DURATIONS = [
  '1 Month',
  '6 Month',
  '1 Year',
  '2 Years',
  '3 Years',
];

const MAX_PRICE = 10000;

export function FilterSidebar({
  selectedBrands,
  onBrandChange,
  selectedColors,
  onColorChange,
  selectedDurations,
  onDurationChange,
  priceRange,
  onPriceRangeChange,
  availableBrands,
}: FilterSidebarProps) {
  const [brandSearch, setBrandSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    color: true,
    duration: true,
    price: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandChange(selectedBrands.filter((b) => b !== brand));
    } else {
      onBrandChange([...selectedBrands, brand]);
    }
  };

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorChange(selectedColors.filter((c) => c !== color));
    } else {
      onColorChange([...selectedColors, color]);
    }
  };

  const toggleDuration = (duration: string) => {
    if (selectedDurations.includes(duration)) {
      onDurationChange(selectedDurations.filter((d) => d !== duration));
    } else {
      onDurationChange([...selectedDurations, duration]);
    }
  };

  const filteredBrands = availableBrands.filter((brand) =>
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Brand Filter */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <button
            onClick={() => toggleSection('brand')}
            className="flex w-full items-center justify-between"
          >
            <CardTitle className="text-base font-semibold">Brand</CardTitle>
            {expandedSections.brand ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </CardHeader>
        {expandedSections.brand && (
          <CardContent className="space-y-3">
            {/* Brand Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="h-9 pl-9 text-sm"
              />
            </div>
            {/* Brand List */}
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <div key={brand} className="flex items-center gap-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={() => toggleBrand(brand)}
                    />
                    <Label
                      htmlFor={`brand-${brand}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {brand}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No brands found</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Color Filter */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <button
            onClick={() => toggleSection('color')}
            className="flex w-full items-center justify-between"
          >
            <CardTitle className="text-base font-semibold">Color</CardTitle>
            {expandedSections.color ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </CardHeader>
        {expandedSections.color && (
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => toggleColor(color.value)}
                  className={cn(
                    'group relative h-12 w-12 rounded-full border-2 transition-all',
                    selectedColors.includes(color.value)
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  )}
                  title={color.name}
                >
                  <div
                    className="h-full w-full rounded-full"
                    style={{ backgroundColor: color.hex }}
                  />
                  {selectedColors.includes(color.value) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-white ring-2 ring-black/20" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Duration Filter */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <button
            onClick={() => toggleSection('duration')}
            className="flex w-full items-center justify-between"
          >
            <CardTitle className="text-base font-semibold">Duration</CardTitle>
            {expandedSections.duration ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </CardHeader>
        {expandedSections.duration && (
          <CardContent className="space-y-2">
            {RENTAL_DURATIONS.map((duration) => (
              <div key={duration} className="flex items-center gap-2">
                <Checkbox
                  id={`duration-${duration}`}
                  checked={selectedDurations.includes(duration)}
                  onCheckedChange={() => toggleDuration(duration)}
                />
                <Label
                  htmlFor={`duration-${duration}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {duration}
                </Label>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Price Range Filter */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <button
            onClick={() => toggleSection('price')}
            className="flex w-full items-center justify-between"
          >
            <CardTitle className="text-base font-semibold">Price Range</CardTitle>
            {expandedSections.price ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </CardHeader>
        {expandedSections.price && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Slider
                min={0}
                max={MAX_PRICE}
                step={10}
                value={priceRange}
                onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">${priceRange[0]}</span>
                <span className="font-medium">${priceRange[1]}</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
