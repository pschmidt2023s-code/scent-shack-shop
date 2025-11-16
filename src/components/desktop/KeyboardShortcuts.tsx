import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

/**
 * Desktop keyboard shortcuts for power users
 * - Ctrl/Cmd + K: Search
 * - Ctrl/Cmd + B: Cart
 * - Ctrl/Cmd + H: Home
 * - Ctrl/Cmd + P: Profile
 * - ?: Show shortcuts help
 */
export function KeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Check for modifier key (Ctrl on Windows/Linux, Cmd on Mac)
      const modKey = e.ctrlKey || e.metaKey;

      // Show help with '?'
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        showShortcutsHelp();
        return;
      }

      if (!modKey) return;

      // Prevent default for our shortcuts
      const shortcuts: { [key: string]: () => void } = {
        'k': () => {
          e.preventDefault();
          // Focus search input
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        },
        'b': () => {
          e.preventDefault();
          // Open cart (trigger cart button click)
          const cartButton = document.querySelector('[aria-label*="Warenkorb"]') as HTMLButtonElement;
          if (cartButton) cartButton.click();
        },
        'h': () => {
          e.preventDefault();
          navigate('/');
        },
        'p': () => {
          e.preventDefault();
          navigate('/profile');
        },
        'f': () => {
          e.preventDefault();
          navigate('/favorites');
        },
        's': () => {
          e.preventDefault();
          navigate('/products');
        }
      };

      const action = shortcuts[e.key.toLowerCase()];
      if (action) {
        action();
      }
    };

    const showShortcutsHelp = () => {
      toast({
        title: "⌨️ Tastaturkürzel",
        description: (
          <div className="text-sm space-y-1 mt-2">
            <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+K</kbd> Suche öffnen</div>
            <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+B</kbd> Warenkorb öffnen</div>
            <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+H</kbd> Startseite</div>
            <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+P</kbd> Profil</div>
            <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+F</kbd> Favoriten</div>
            <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd> Shop</div>
            <div className="pt-2 border-t mt-2"><kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd> Diese Hilfe anzeigen</div>
          </div>
        ),
        duration: 10000,
      });
    };

    // Only enable on desktop
    if (window.innerWidth >= 768) {
      document.addEventListener('keydown', handleKeyboard);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, [navigate]);

  return null;
}
