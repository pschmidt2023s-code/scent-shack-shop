import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X, Sparkles } from 'lucide-react'
import { perfumes } from '@/data/perfumes'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

interface SearchSuggestion {
  id: string
  name: string
  type: 'product' | 'category' | 'brand'
  category?: string
  number?: string
}

interface AdvancedSearchProps {
  onResultClick?: (result: SearchSuggestion) => void
  className?: string
  placeholder?: string
}

export function AdvancedSearch({ onResultClick, className, placeholder = "Parfüm suchen..." }: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recent-searches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [])

  // Generate suggestions based on query
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const searchResults: SearchSuggestion[] = []
    const queryLower = query.toLowerCase()

    // Search through all perfume variants
    perfumes.forEach(perfume => {
      perfume.variants.forEach(variant => {
        if (
          variant.name.toLowerCase().includes(queryLower) ||
          variant.number.toLowerCase().includes(queryLower) ||
          variant.description.toLowerCase().includes(queryLower) ||
          perfume.category.toLowerCase().includes(queryLower)
        ) {
          searchResults.push({
            id: variant.id,
            name: variant.name,
            type: 'product',
            category: perfume.category,
            number: variant.number
          })
        }
      })
    })

    // Add category suggestions
    const categories = [...new Set(perfumes.map(p => p.category))]
    categories.forEach(category => {
      if (category.toLowerCase().includes(queryLower)) {
        searchResults.push({
          id: category,
          name: category,
          type: 'category'
        })
      }
    })

    // Limit results and sort by relevance
    const limitedResults = searchResults
      .slice(0, 8)
      .sort((a, b) => {
        const aExact = a.name.toLowerCase().startsWith(queryLower)
        const bExact = b.name.toLowerCase().startsWith(queryLower)
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        return 0
      })

    setSuggestions(limitedResults)
  }, [query])

  const addToRecentSearches = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(term => term !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recent-searches', JSON.stringify(updated))
  }

  const handleSearch = (searchTerm?: string) => {
    const term = searchTerm || query
    if (term.trim()) {
      addToRecentSearches(term.trim())
      navigate(`/products?search=${encodeURIComponent(term.trim())}`)
      setQuery('')
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      // Find the perfume that contains this variant
      const perfume = perfumes.find(p => 
        p.variants.some(v => v.id === suggestion.id)
      )
      if (perfume) {
        navigate(`/product/${perfume.id}`)
      }
    } else if (suggestion.type === 'category') {
      navigate(`/products?category=${encodeURIComponent(suggestion.name)}`)
    }
    
    addToRecentSearches(suggestion.name)
    setQuery('')
    setShowSuggestions(false)
    onResultClick?.(suggestion)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recent-searches')
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Sparkles className="w-4 h-4" />
      case 'category':
        return <Search className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => setShowSuggestions(false), 150)
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              inputRef.current?.focus()
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-96 overflow-y-auto"
        >
          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Letzte Suchen</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="h-auto p-1 text-xs"
                >
                  Löschen
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSearch(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  className={cn(
                    "w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center gap-3",
                    selectedIndex === index && "bg-muted"
                  )}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="text-muted-foreground">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{suggestion.name}</div>
                    {suggestion.number && (
                      <div className="text-sm text-muted-foreground">{suggestion.number}</div>
                    )}
                    {suggestion.category && (
                      <div className="text-xs text-muted-foreground">{suggestion.category}</div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.type === 'product' ? 'Produkt' : 'Kategorie'}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && suggestions.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Keine Ergebnisse für "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}