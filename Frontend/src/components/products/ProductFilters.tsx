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
  'Photography',
  'Videography',
  'Lighting',
  'Audio',
  'Gaming',
  'Electronics',
  'Tools',
  'Sports',
  'Events',
  'Other'
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rounded-xl pl-10 bg-white"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full rounded-xl sm:w-[180px] bg-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>

        {/* Mobile Filters */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-xl sm:hidden">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="ml-2">
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
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        <span className="text-sm text-muted-foreground">Categories:</span>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategories.includes(category) ? 'default' : 'outline'}
            className="cursor-pointer rounded-lg transition-colors"
            onClick={() => toggleCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1 rounded-lg">
              Search: {searchQuery}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {selectedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1 rounded-lg">
              {category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleCategory(category)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
