import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'user' | 'loyal' | 'premium' | 'admin';
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

const TIER_DISCOUNTS: Record<LoyaltyTier, number> = {
  bronze: 0,
  silver: 3,
  gold: 5,
  platinum: 8,
};

const TIER_LABELS: Record<LoyaltyTier, string> = {
  bronze: 'Bronze',
  silver: 'Silber',
  gold: 'Gold',
  platinum: 'Platin',
};

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [tier, setTier] = useState<LoyaltyTier>('bronze');
  const [isNewsletterSubscriber, setIsNewsletterSubscriber] = useState(false);
  const [cashbackBalance, setCashbackBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      
      if (!user) {
        setRole('user');
        setTier('bronze');
        setIsNewsletterSubscriber(false);
        setCashbackBalance(0);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/loyalty', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          
          const userTier = (data.tier as LoyaltyTier) || 'bronze';
          setTier(userTier);
          setCashbackBalance(data.cashbackBalance || 0);
          
          let userRole: UserRole = 'user';
          
          if (user.role === 'admin') {
            userRole = 'admin';
          } else if (userTier === 'gold' || userTier === 'platinum') {
            userRole = 'premium';
          } else if (userTier === 'silver' || data.isNewsletterSubscriber) {
            userRole = 'loyal';
          }
          
          setRole(userRole);
          setIsNewsletterSubscriber(data.isNewsletterSubscriber || false);
        } else {
          setRole(user.role === 'admin' ? 'admin' : 'user');
          setTier('bronze');
        }
      } catch (error) {
        console.error('Error in useUserRole:', error);
        setRole(user.role === 'admin' ? 'admin' : 'user');
        setTier('bronze');
        setIsNewsletterSubscriber(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const getDiscount = () => {
    let discount = TIER_DISCOUNTS[tier];
    
    if (user?.role === 'admin') {
      discount = Math.max(discount, 10);
    }
    
    if (isNewsletterSubscriber) {
      discount += 1.5;
    }
    
    return discount;
  };

  const getRoleLabel = () => {
    if (role === 'admin') return 'Administrator';
    return `${TIER_LABELS[tier]} Mitglied`;
  };

  const getTierLabel = () => TIER_LABELS[tier];

  const getNextTier = (): { tier: LoyaltyTier; requiredSpend: number } | null => {
    switch (tier) {
      case 'bronze':
        return { tier: 'silver', requiredSpend: 50 };
      case 'silver':
        return { tier: 'gold', requiredSpend: 200 };
      case 'gold':
        return { tier: 'platinum', requiredSpend: 500 };
      default:
        return null;
    }
  };

  return {
    role,
    tier,
    isAdmin: role === 'admin',
    isNewsletterSubscriber,
    loading,
    discount: getDiscount(),
    roleLabel: getRoleLabel(),
    tierLabel: getTierLabel(),
    tierDiscount: TIER_DISCOUNTS[tier],
    cashbackBalance,
    nextTier: getNextTier(),
  };
}
