import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'user' | 'loyal' | 'premium' | 'admin';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [isNewsletterSubscriber, setIsNewsletterSubscriber] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      
      if (!user) {
        setRole('user');
        setIsNewsletterSubscriber(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/loyalty', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          
          let userRole: UserRole = 'user';
          
          if (user.role === 'admin') {
            userRole = 'admin';
          } else if (data.tier === 'gold' || data.tier === 'platinum') {
            userRole = 'premium';
          } else if (data.tier === 'silver' || data.isNewsletterSubscriber) {
            userRole = 'loyal';
          }
          
          setRole(userRole);
          setIsNewsletterSubscriber(data.isNewsletterSubscriber || false);
        } else {
          setRole(user.role === 'admin' ? 'admin' : 'user');
        }
      } catch (error) {
        console.error('Error in useUserRole:', error);
        setRole(user.role === 'admin' ? 'admin' : 'user');
        setIsNewsletterSubscriber(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const getDiscount = () => {
    let discount = 0;
    
    console.log('getDiscount: Calculating discount for role:', role, 'newsletter:', isNewsletterSubscriber);
    
    if (role === 'loyal') discount += 3.5;
    if (role === 'premium' || role === 'admin') discount += 6.5;
    if (isNewsletterSubscriber) discount += 1.5;
    
    console.log('getDiscount: Final discount calculated:', discount);
    return discount;
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'premium':
        return 'Premium Kunde';
      case 'loyal':
        return 'Loyaler Kunde';
      default:
        return 'Kunde';
    }
  };

  return {
    role,
    isAdmin: role === 'admin',
    isNewsletterSubscriber,
    loading,
    discount: getDiscount(),
    roleLabel: getRoleLabel(),
  };
}
