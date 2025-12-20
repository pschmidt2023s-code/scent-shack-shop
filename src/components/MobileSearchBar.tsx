import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
}

export function MobileSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const searchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) {
          const products = await response.json();
          setResults(products.slice(0, 5));
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (productId: string) => {
    navigate(`/product/${productId}`);
    setQuery('');
    setShowResults(false);
    setIsFocused(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setQuery('');
      setShowResults(false);
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  return (
    <div 
      ref={containerRef}
      className="sticky top-[68px] z-40 md:hidden bg-background border-b border-border px-4 py-2"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Suche nach Düften..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="pl-10 pr-10 h-10 bg-muted border-border"
            data-testid="input-mobile-search"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={handleClear}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {showResults && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
            {results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelect(result.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
              >
                <img
                  src={result.image || '/placeholder.svg'}
                  alt={result.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{result.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{result.category}</p>
                </div>
              </button>
            ))}
            {query.trim() && (
              <button
                type="button"
                onClick={() => {
                  if (query.trim()) {
                    navigate(`/products?search=${encodeURIComponent(query)}`);
                    setQuery('');
                    setShowResults(false);
                    setIsFocused(false);
                  }
                }}
                className="w-full p-3 text-sm text-primary font-medium border-t hover:bg-muted transition-colors"
              >
                Alle Ergebnisse anzeigen
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
