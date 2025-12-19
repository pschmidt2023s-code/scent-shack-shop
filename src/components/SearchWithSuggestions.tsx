import { useState, useEffect, useRef } from 'react';
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

interface SearchWithSuggestionsProps {
  onClose: () => void;
}

export function SearchWithSuggestions({ onClose }: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
          setResults(products.slice(0, 6));
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

  const handleSelect = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg animate-in slide-in-from-top-2 duration-200 z-50">
      <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Suche nach Düften, Marken..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button type="button" onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </form>

        {showResults && results.length > 0 && (
          <div className="mt-2 border border-border rounded-lg overflow-hidden bg-card">
            {results.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelect(product.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                data-testid={`search-result-${product.id}`}
              >
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.brand} - {product.category}</p>
                </div>
              </button>
            ))}
            <button
              onClick={handleSubmit}
              className="w-full p-3 text-sm text-primary hover:bg-muted transition-colors border-t border-border"
            >
              Alle Ergebnisse anzeigen
            </button>
          </div>
        )}

        {showResults && results.length === 0 && debouncedQuery.length >= 2 && !loading && (
          <div className="mt-2 p-4 text-center text-muted-foreground border border-border rounded-lg">
            Keine Produkte gefunden für "{debouncedQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
