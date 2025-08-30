import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X, Filter, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterOptions {
  categories: string[]
  priceRange: [number, number]
  ratings: number[]
  inStock: boolean
  verified: boolean
}

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  onFiltersChange: (filters: FilterOptions) => void
  className?: string
}

const CATEGORIES = [
  { id: '50ML Bottles', label: '50ml Flakons', count: 12 },
  { id: 'Proben', label: 'Proben (5ml)', count: 24 },
]

const PRICE_RANGES = [
  { label: 'Unter 10€', min: 0, max: 10 },
  { label: '10€ - 25€', min: 10, max: 25 },
  { label: '25€ - 50€', min: 25, max: 50 },
  { label: '50€ - 100€', min: 50, max: 100 },
  { label: 'Über 100€', min: 100, max: 1000 },
]

export function FilterSidebar({ isOpen, onClose, onFiltersChange, className }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 200],
    ratings: [],
    inStock: false,
    verified: false
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  useEffect(() => {
    // Count active filters
    const count = 
      filters.categories.length +
      (filters.priceRange[0] > 0 || filters.priceRange[1] < 200 ? 1 : 0) +
      filters.ratings.length +
      (filters.inStock ? 1 : 0) +
      (filters.verified ? 1 : 0)
    
    setActiveFiltersCount(count)
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilters = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId]
    updateFilters('categories', newCategories)
  }

  const toggleRating = (rating: number) => {
    const newRatings = filters.ratings.includes(rating)
      ? filters.ratings.filter(r => r !== rating)
      : [...filters.ratings, rating]
    updateFilters('ratings', newRatings)
  }

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 200],
      ratings: [],
      inStock: false,
      verified: false
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className={cn("fixed inset-0 z-50 lg:relative lg:inset-auto", className)}>
      {/* Overlay for mobile */}
      <div 
        className="absolute inset-0 bg-black/50 lg:hidden" 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <Card className="absolute right-0 top-0 h-full w-80 lg:relative lg:w-full lg:h-auto overflow-y-auto">
        <CardHeader className="sticky top-0 bg-background z-10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Alle löschen
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-4">
          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Kategorie</h3>
            <div className="space-y-2">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <label
                    htmlFor={category.id}
                    className="text-sm flex-1 cursor-pointer"
                  >
                    {category.label}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    ({category.count})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Preisspanne</h3>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilters('priceRange', value as [number, number])}
                max={200}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>€{filters.priceRange[0]}</span>
                <span>€{filters.priceRange[1]}</span>
              </div>
            </div>
            
            {/* Quick price filters */}
            <div className="space-y-1">
              {PRICE_RANGES.map((range, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => updateFilters('priceRange', [range.min, range.max])}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Rating Filter */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Bewertung</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={filters.ratings.includes(rating)}
                    onCheckedChange={() => toggleRating(rating)}
                  />
                  <label
                    htmlFor={`rating-${rating}`}
                    className="text-sm flex-1 cursor-pointer flex items-center gap-2"
                  >
                    {renderStars(rating)}
                    <span>& mehr</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Additional Filters */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Zusätzliche Filter</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) => updateFilters('inStock', checked)}
                />
                <label htmlFor="in-stock" className="text-sm cursor-pointer">
                  Nur verfügbare Artikel
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filters.verified}
                  onCheckedChange={(checked) => updateFilters('verified', checked)}
                />
                <label htmlFor="verified" className="text-sm cursor-pointer">
                  Nur verifizierte Bewertungen
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}