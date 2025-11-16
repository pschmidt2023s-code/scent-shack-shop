import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auto_reorder_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_order_date', { ascending: true });

      if (error) throw error;

      setSubscriptions(
        data?.map((sub) => ({
          id: sub.id,
          productId: sub.product_id,
          variantId: sub.variant_id,
          frequencyDays: sub.frequency_days,
          nextOrderDate: sub.next_order_date,
          quantity: sub.quantity,
          isActive: sub.is_active,
        })) || []
      );
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
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

      const { error } = await supabase.from('auto_reorder_subscriptions').insert({
        user_id: user.id,
        product_id: productId,
        variant_id: variantId,
        frequency_days: frequencyDays,
        next_order_date: nextDate.toISOString().split('T')[0],
        quantity,
      });

      if (error) throw error;

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
      const updateData: any = {};
      if (updates.frequencyDays !== undefined) {
        updateData.frequency_days = updates.frequencyDays;
      }
      if (updates.quantity !== undefined) {
        updateData.quantity = updates.quantity;
      }
      if (updates.isActive !== undefined) {
        updateData.is_active = updates.isActive;
      }

      const { error } = await supabase
        .from('auto_reorder_subscriptions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchSubscriptions();
      toast.success('Auto-Nachbestellung aktualisiert');
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('auto_reorder_subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
