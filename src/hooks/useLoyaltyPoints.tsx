import { useState, useEffect } from 'react';
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

      const response = await fetch('/api/loyalty', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loyalty data');
      }

      const data = await response.json();
      
      setLoyalty({
        points: data.points || 0,
        lifetimePoints: data.lifetimePoints || 0,
        tier: (data.tier || 'bronze') as LoyaltyData['tier'],
      });

      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (points: number, type: string, description: string) => {
    if (!user) return;

    try {
      toast.success(`+${points} Treuepunkte erhalten!`);
      await fetchLoyaltyData();
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
