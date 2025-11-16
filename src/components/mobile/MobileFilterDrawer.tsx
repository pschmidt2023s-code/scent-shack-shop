import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterOptions {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  inStock: boolean;
  onSale: boolean;
}

interface MobileFilterDrawerProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

const categories = ['Damen', 'Herren', 'Unisex', 'Auto Düfte'];
const brands = ['Tom Ford', 'Dior', 'Chanel', 'YSL', 'Creed', 'Versace'];

export function MobileFilterDrawer({
  filters,
  onFiltersChange,
  onReset
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const activeFilterCount = 
    localFilters.categories.length +
    localFilters.brands.length +
    (localFilters.inStock ? 1 : 0) +
    (localFilters.onSale ? 1 : 0);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    onReset();
    setLocalFilters({
      categories: [],
      brands: [],
      priceRange: [0, 500],
      inStock: false,
      onSale: false
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filter
          {activeFilterCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Filter & Sortierung</SheetTitle>
          <SheetDescription>
            Finde dein perfektes Parfüm
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(85vh-180px)] mt-6">
          <div className="space-y-6 pr-4">
            {/* Kategorien */}
            <div>
              <h3 className="font-semibold mb-3">Kategorie</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={localFilters.categories.includes(category)}
                      onCheckedChange={(checked) => {
                        setLocalFilters({
                          ...localFilters,
                          categories: checked
                            ? [...localFilters.categories, category]
                            : localFilters.categories.filter(c => c !== category)
                        });
                      }}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Marken */}
            <div>
              <h3 className="font-semibold mb-3">Marke</h3>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={localFilters.brands.includes(brand)}
                      onCheckedChange={(checked) => {
                        setLocalFilters({
                          ...localFilters,
                          brands: checked
                            ? [...localFilters.brands, brand]
                            : localFilters.brands.filter(b => b !== brand)
                        });
                      }}
                    />
                    <Label
                      htmlFor={`brand-${brand}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Preisspanne */}
            <div>
              <h3 className="font-semibold mb-3">Preisspanne</h3>
              <div className="px-2">
                <Slider
                  value={localFilters.priceRange}
                  onValueChange={(value) => {
                    setLocalFilters({
                      ...localFilters,
                      priceRange: value as [number, number]
                    });
                  }}
                  min={0}
                  max={500}
                  step={10}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{localFilters.priceRange[0]}€</span>
                  <span>{localFilters.priceRange[1]}€</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Verfügbarkeit & Angebote */}
            <div>
              <h3 className="font-semibold mb-3">Weitere Filter</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={localFilters.inStock}
                    onCheckedChange={(checked) => {
                      setLocalFilters({
                        ...localFilters,
                        inStock: checked as boolean
                      });
                    }}
                  />
                  <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
                    Nur verfügbare Artikel
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onSale"
                    checked={localFilters.onSale}
                    onCheckedChange={(checked) => {
                      setLocalFilters({
                        ...localFilters,
                        onSale: checked as boolean
                      });
                    }}
                  />
                  <Label htmlFor="onSale" className="text-sm font-normal cursor-pointer">
                    Im Angebot
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex flex-row gap-2 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleReset}
          >
            <X className="w-4 h-4 mr-2" />
            Zurücksetzen
          </Button>
          <Button
            className="flex-1"
            onClick={handleApply}
          >
            Anwenden ({activeFilterCount})
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
