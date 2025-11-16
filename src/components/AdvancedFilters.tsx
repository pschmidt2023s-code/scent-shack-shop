import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilterOptions {
  priceRange: [number, number];
  brands: string[];
  categories: string[];
  inStock: boolean;
  onSale: boolean;
  sortBy: string;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableBrands: string[];
  availableCategories: string[];
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  availableBrands,
  availableCategories,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      priceRange: [0, 100],
      brands: [],
      categories: [],
      inStock: false,
      onSale: false,
      sortBy: 'popular',
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const activeFiltersCount =
    (localFilters.brands.length > 0 ? 1 : 0) +
    (localFilters.categories.length > 0 ? 1 : 0) +
    (localFilters.inStock ? 1 : 0) +
    (localFilters.onSale ? 1 : 0) +
    (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 100 ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <SlidersHorizontal className="w-4 h-4" />
          Filter
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-1 px-1.5 py-0 h-5 min-w-[20px]">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter & Sortierung</SheetTitle>
          <SheetDescription>Verfeinere deine Produktsuche</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] pr-4">
          <div className="space-y-6 py-6">
            {/* Price Range */}
            <div className="space-y-3">
              <Label>Preisspanne</Label>
              <div className="px-2">
                <Slider
                  value={localFilters.priceRange}
                  onValueChange={(value) =>
                    setLocalFilters({ ...localFilters, priceRange: value as [number, number] })
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>€{localFilters.priceRange[0]}</span>
                  <span>€{localFilters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-3">
              <Label>Marken</Label>
              <div className="space-y-2">
                {availableBrands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={localFilters.brands.includes(brand)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setLocalFilters({
                            ...localFilters,
                            brands: [...localFilters.brands, brand],
                          });
                        } else {
                          setLocalFilters({
                            ...localFilters,
                            brands: localFilters.brands.filter((b) => b !== brand),
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`brand-${brand}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <Label>Kategorien</Label>
              <div className="space-y-2">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={localFilters.categories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setLocalFilters({
                            ...localFilters,
                            categories: [...localFilters.categories, category],
                          });
                        } else {
                          setLocalFilters({
                            ...localFilters,
                            categories: localFilters.categories.filter((c) => c !== category),
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock & Sale */}
            <div className="space-y-3">
              <Label>Verfügbarkeit</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={localFilters.inStock}
                    onCheckedChange={(checked) =>
                      setLocalFilters({ ...localFilters, inStock: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="inStock"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Nur verfügbare Produkte
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onSale"
                    checked={localFilters.onSale}
                    onCheckedChange={(checked) =>
                      setLocalFilters({ ...localFilters, onSale: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="onSale"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Im Angebot
                  </label>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1 gap-2">
            <X className="w-4 h-4" />
            Zurücksetzen
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Filter anwenden
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
