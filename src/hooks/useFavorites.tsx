import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Favorite {
  id: string;
  perfume_id: string;
  variant_id: string;
  created_at: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(false);
    if (user) {
      loadFavoritesFromAPI();
    } else {
      loadFavoritesFromLocalStorage();
    }
  }, [user]);

  const loadFavoritesFromAPI = async () => {
    if (!user) return;
    try {
      const { data, error } = await api.favorites.list();
      if (error) throw new Error(error);
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      loadFavoritesFromLocalStorage();
    }
  };

  const loadFavoritesFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        const perfumeIds = JSON.parse(stored);
        const localFavorites: Favorite[] = perfumeIds.map((perfumeId: string, index: number) => ({
          id: `local-${index}`,
          perfume_id: perfumeId,
          variant_id: '',
          created_at: new Date().toISOString()
        }));
        setFavorites(localFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  };

  const addToFavorites = async (perfumeId: string, variantId: string) => {
    if (user) {
      try {
        const { data, error } = await api.favorites.add(perfumeId);
        if (error) {
          if (error.includes('already')) {
            toast({ title: "Bereits in Favoriten" });
            return false;
          }
          throw new Error(error);
        }
        if (data) {
          setFavorites(prev => [data, ...prev]);
        }
        toast({ title: "Zu Favoriten hinzugefügt" });
        return true;
      } catch (error) {
        console.error('Error adding to favorites:', error);
        return false;
      }
    } else {
      try {
        const stored = localStorage.getItem('wishlist');
        const current = stored ? JSON.parse(stored) : [];
        if (!current.includes(perfumeId)) {
          current.push(perfumeId);
          localStorage.setItem('wishlist', JSON.stringify(current));
          const newFavorite: Favorite = { id: `local-${Date.now()}`, perfume_id: perfumeId, variant_id: variantId, created_at: new Date().toISOString() };
          setFavorites(prev => [newFavorite, ...prev]);
          toast({ title: "Zu Favoriten hinzugefügt" });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error adding to localStorage favorites:', error);
        return false;
      }
    }
  };

  const removeFromFavorites = async (perfumeId: string, variantId: string) => {
    if (user) {
      try {
        const { error } = await api.favorites.remove(perfumeId);
        if (error) throw new Error(error);
        setFavorites(prev => prev.filter(f => !(f.perfume_id === perfumeId && f.variant_id === variantId)));
        toast({ title: "Aus Favoriten entfernt" });
        return true;
      } catch (error) {
        console.error('Error removing from favorites:', error);
        return false;
      }
    } else {
      try {
        const stored = localStorage.getItem('wishlist');
        const current = stored ? JSON.parse(stored) : [];
        const updated = current.filter((id: string) => id !== perfumeId);
        localStorage.setItem('wishlist', JSON.stringify(updated));
        setFavorites(prev => prev.filter(f => f.perfume_id !== perfumeId));
        toast({ title: "Aus Favoriten entfernt" });
        return true;
      } catch (error) {
        console.error('Error removing from localStorage favorites:', error);
        return false;
      }
    }
  };

  const isFavorite = (perfumeId: string, variantId: string): boolean => {
    return favorites.some(f => f.perfume_id === perfumeId && f.variant_id === variantId);
  };

  return { favorites, loading, addToFavorites, removeFromFavorites, isFavorite, count: favorites.length };
}
