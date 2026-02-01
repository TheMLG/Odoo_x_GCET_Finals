import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Categories list
const categories = [
  'electronics',
  'cameras',
  'Uncategorized'
];

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function ProductFilters({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  sortBy,
  onSortChange,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    onSearchChange('');
    onCategoryChange([]);
    onSortChange('featured');
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name, category, or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-12 rounded-lg border-2 border-border bg-white pl-12 text-base font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-12 w-full rounded-lg border-2 sm:w-[200px] bg-white text-base font-medium transition-all hover:border-primary">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured" className="font-medium">Featured</SelectItem>
            <SelectItem value="price-low" className="font-medium">Price: Low to High</SelectItem>
            <SelectItem value="price-high" className="font-medium">Price: High to Low</SelectItem>
            <SelectItem value="name" className="font-medium">Name</SelectItem>
            <SelectItem value="newest" className="font-medium">Newest</SelectItem>
          </SelectContent>
        </Select>

        {/* Mobile Filters */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-12 rounded-lg border-2 font-semibold sm:hidden">
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              Filters
              {selectedCategories.length > 0 && (
                <Badge variant="default" className="ml-2 rounded-full">
                  {selectedCategories.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Categories</Label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox
                        id={`mobile-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label htmlFor={`mobile-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Category Filters */}
      <div className="hidden flex-wrap items-center gap-3 sm:flex">
        <span className="text-sm font-semibold text-foreground">Categories:</span>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategories.includes(category) ? 'default' : 'outline'}
            className="cursor-pointer rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all hover:scale-105 hover:shadow-md"
            onClick={() => toggleCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
          <span className="text-sm font-semibold text-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-2 rounded-lg px-3 py-1.5 font-medium">
              Search: {searchQuery}
              <X
                className="h-4 w-4 cursor-pointer transition-transform hover:scale-125"
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {selectedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="gap-2 rounded-lg px-3 py-1.5 font-medium">
              {category}
              <X
                className="h-4 w-4 cursor-pointer transition-transform hover:scale-125"
                onClick={() => toggleCategory(category)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto font-semibold text-primary transition-all hover:scale-105"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
