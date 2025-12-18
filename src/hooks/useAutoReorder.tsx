import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AutoReorderSubscription {
  id: string;
  productId: string;
  variantId: string;
  frequencyDays: number;
  nextOrderDate: string;
  quantity: number;
  isActive: boolean;
}

export function useAutoReorder() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<AutoReorderSubscription[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/auto-reorder', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        setSubscriptions([]);
        return;
      }

      const data = await response.json();
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (
    productId: string,
    variantId: string,
    frequencyDays: number,
    quantity: number = 1
  ) => {
    if (!user) {
      toast.error('Bitte melde dich an');
      return;
    }

    try {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + frequencyDays);

      const response = await fetch('/api/auto-reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          variantId,
          frequencyDays,
          nextOrderDate: nextDate.toISOString().split('T')[0],
          quantity,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      await fetchSubscriptions();
      toast.success('Auto-Nachbestellung aktiviert!');
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Fehler beim Aktivieren der Auto-Nachbestellung');
    }
  };

  const updateSubscription = async (
    id: string,
    updates: Partial<{
      frequencyDays: number;
      quantity: number;
      isActive: boolean;
    }>
  ) => {
    try {
      const response = await fetch(`/api/auto-reorder/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      await fetchSubscriptions();
      toast.success('Auto-Nachbestellung aktualisiert');
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      const response = await fetch(`/api/auto-reorder/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscription');
      }

      await fetchSubscriptions();
      toast.success('Auto-Nachbestellung gelöscht');
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  return {
    subscriptions,
    loading,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    refetch: fetchSubscriptions,
  };
}
