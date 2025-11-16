import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LoyaltyData {
  points: number;
  lifetimePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface Transaction {
  id: string;
  points: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

export function useLoyaltyPoints() {
  const { user } = useAuth();
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
    } else {
      setLoyalty(null);
      setTransactions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch or create loyalty account
      let { data: loyaltyData, error: loyaltyError } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (loyaltyError) throw loyaltyError;

      // Create if doesn't exist
      if (!loyaltyData) {
        const { data: newLoyalty, error: createError } = await supabase
          .from('loyalty_points')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        loyaltyData = newLoyalty;
      }

      setLoyalty({
        points: loyaltyData.points,
        lifetimePoints: loyaltyData.lifetime_points,
        tier: loyaltyData.tier as LoyaltyData['tier'],
      });

      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txError) throw txError;

      setTransactions(
        txData?.map((tx) => ({
          id: tx.id,
          points: tx.points,
          transactionType: tx.transaction_type,
          description: tx.description || '',
          createdAt: tx.created_at,
        })) || []
      );
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      toast.error('Fehler beim Laden der Treuepunkte');
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (points: number, type: string, description: string) => {
    if (!user) return;

    try {
      // Add transaction
      await supabase.from('loyalty_transactions').insert({
        user_id: user.id,
        points,
        transaction_type: type,
        description,
      });

      // Update points
      const { error } = await supabase.rpc('add_loyalty_points', {
        p_user_id: user.id,
        p_points: points,
      });

      if (error) throw error;

      await fetchLoyaltyData();
      toast.success(`+${points} Treuepunkte erhalten!`);
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const getTierInfo = () => {
    if (!loyalty) return null;

    const tiers = {
      bronze: { name: 'Bronze', minPoints: 0, maxPoints: 499, color: '#CD7F32' },
      silver: { name: 'Silber', minPoints: 500, maxPoints: 1499, color: '#C0C0C0' },
      gold: { name: 'Gold', minPoints: 1500, maxPoints: 4999, color: '#FFD700' },
      platinum: { name: 'Platin', minPoints: 5000, maxPoints: Infinity, color: '#E5E4E2' },
    };

    const current = tiers[loyalty.tier];
    const nextTier = loyalty.tier === 'platinum' 
      ? null 
      : Object.values(tiers).find(t => t.minPoints > loyalty.lifetimePoints);

    return {
      current,
      next: nextTier,
      progress: nextTier 
        ? ((loyalty.lifetimePoints - current.minPoints) / (nextTier.minPoints - current.minPoints)) * 100
        : 100,
    };
  };

  return {
    loyalty,
    transactions,
    loading,
    addPoints,
    getTierInfo,
    refetch: fetchLoyaltyData,
  };
}
