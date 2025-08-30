import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Favorite {
  id: string;
  perfume_id: string;
  variant_id: string;
  created_at: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load favorites from Supabase or localStorage
  useEffect(() => {
    if (user) {
      loadFavoritesFromSupabase();
    } else {
      loadFavoritesFromLocalStorage();
    }
  }, [user]);

  const loadFavoritesFromSupabase = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Die Favoriten konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFavoritesFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        const perfumeIds = JSON.parse(stored);
        // Convert localStorage format to favorites format
        const localFavorites: Favorite[] = perfumeIds.map((perfumeId: string, index: number) => ({
          id: `local-${index}`,
          perfume_id: perfumeId,
          variant_id: '', // We'll need to handle this differently for localStorage
          created_at: new Date().toISOString()
        }));
        setFavorites(localFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (perfumeId: string, variantId: string) => {
    if (user) {
      // Supabase version
      try {
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            perfume_id: perfumeId,
            variant_id: variantId
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            toast({
              title: "Bereits in Favoriten",
              description: "Dieses Produkt ist bereits in Ihren Favoriten.",
            });
            return false;
          }
          throw error;
        }

        setFavorites(prev => [data, ...prev]);
        toast({
          title: "Zu Favoriten hinzugefügt",
          description: "Das Produkt wurde zu Ihren Favoriten hinzugefügt.",
        });
        return true;
      } catch (error) {
        console.error('Error adding to favorites:', error);
        toast({
          title: "Fehler",
          description: "Das Produkt konnte nicht zu den Favoriten hinzugefügt werden.",
          variant: "destructive",
        });
        return false;
      }
    } else {
      // localStorage version (fallback)
      try {
        const stored = localStorage.getItem('wishlist');
        const current = stored ? JSON.parse(stored) : [];
        
        if (!current.includes(perfumeId)) {
          current.push(perfumeId);
          localStorage.setItem('wishlist', JSON.stringify(current));
          
          const newFavorite: Favorite = {
            id: `local-${Date.now()}`,
            perfume_id: perfumeId,
            variant_id: variantId,
            created_at: new Date().toISOString()
          };
          
          setFavorites(prev => [newFavorite, ...prev]);
          toast({
            title: "Zu Favoriten hinzugefügt",
            description: "Das Produkt wurde zu Ihren Favoriten hinzugefügt.",
          });
          return true;
        } else {
          toast({
            title: "Bereits in Favoriten",
            description: "Dieses Produkt ist bereits in Ihren Favoriten.",
          });
          return false;
        }
      } catch (error) {
        console.error('Error adding to localStorage favorites:', error);
        return false;
      }
    }
  };

  const removeFromFavorites = async (perfumeId: string, variantId?: string) => {
    if (user) {
      // Supabase version
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('perfume_id', perfumeId)
          .eq('variant_id', variantId || '');

        if (error) throw error;

        setFavorites(prev => prev.filter(fav => 
          !(fav.perfume_id === perfumeId && fav.variant_id === (variantId || ''))
        ));
        
        toast({
          title: "Aus Favoriten entfernt",
          description: "Das Produkt wurde aus Ihren Favoriten entfernt.",
        });
        return true;
      } catch (error) {
        console.error('Error removing from favorites:', error);
        toast({
          title: "Fehler",
          description: "Das Produkt konnte nicht aus den Favoriten entfernt werden.",
          variant: "destructive",
        });
        return false;
      }
    } else {
      // localStorage version (fallback)
      try {
        const stored = localStorage.getItem('wishlist');
        const current = stored ? JSON.parse(stored) : [];
        const updated = current.filter((id: string) => id !== perfumeId);
        
        localStorage.setItem('wishlist', JSON.stringify(updated));
        setFavorites(prev => prev.filter(fav => fav.perfume_id !== perfumeId));
        
        toast({
          title: "Aus Favoriten entfernt",
          description: "Das Produkt wurde aus Ihren Favoriten entfernt.",
        });
        return true;
      } catch (error) {
        console.error('Error removing from localStorage favorites:', error);
        return false;
      }
    }
  };

  const isFavorite = (perfumeId: string, variantId?: string) => {
    if (user) {
      return favorites.some(fav => 
        fav.perfume_id === perfumeId && fav.variant_id === (variantId || '')
      );
    } else {
      return favorites.some(fav => fav.perfume_id === perfumeId);
    }
  };

  const toggleFavorite = async (perfumeId: string, variantId: string = '') => {
    if (isFavorite(perfumeId, variantId)) {
      return await removeFromFavorites(perfumeId, variantId);
    } else {
      return await addToFavorites(perfumeId, variantId);
    }
  };

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    count: favorites.length
  };
}