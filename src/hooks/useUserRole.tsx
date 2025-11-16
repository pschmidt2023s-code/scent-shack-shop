import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'user' | 'loyal' | 'premium';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [isNewsletterSubscriber, setIsNewsletterSubscriber] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      
      if (!user) {
        // Not logged in users get no discount
        setRole('user');
        setIsNewsletterSubscriber(false);
        setLoading(false);
        return;
      }

      try {
        // Only proceed with database queries if user is authenticated
        if (!user.email) {
          console.warn('useUserRole: User email not available');
          setRole('user');
          setIsNewsletterSubscriber(false);
          setLoading(false);
          return;
        }

        // Check user role from user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
        }

        // Check loyalty points for automatic tier upgrade
        const { data: loyaltyData, error: loyaltyError } = await supabase
          .from('loyalty_points')
          .select('lifetime_points, tier')
          .eq('user_id', user.id)
          .maybeSingle();

        if (loyaltyError) {
          console.error('Error fetching loyalty data:', loyaltyError);
        }

        let userRole: UserRole = 'user';
        
        // Check newsletter subscription - only if authenticated
        const { data: newsletterData, error: newsletterError } = await supabase
          .from('newsletter_subscriptions')
          .select('id')
          .eq('email', user.email)
          .eq('is_active', true)
          .maybeSingle();

        const isSubscriber = !newsletterError && !!newsletterData;
        setIsNewsletterSubscriber(isSubscriber);

        // Role assignment based on database data
        // Admin role overrides everything
        if (roleData?.role === 'admin') {
          userRole = 'premium';
        } else {
          // Automatisches Tier-Upgrade basierend auf Loyalty Points
          // Gold/Platinum Tier = Premium Kunde
          if (loyaltyData && (loyaltyData.tier === 'gold' || loyaltyData.tier === 'platinum')) {
            userRole = 'premium';
          }
          // Silver Tier oder Newsletter = Loyal Kunde
          else if ((loyaltyData && loyaltyData.tier === 'silver') || isSubscriber) {
            userRole = 'loyal';
          }
          // Bronze Tier oder kein Tier = User
          else {
            userRole = 'user';
          }
        }
        
        setRole(userRole);
      } catch (error) {
        console.error('Error in useUserRole:', error);
        setRole('user');
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
    
    // Role-based discounts
    if (role === 'loyal') discount += 3.5;
    if (role === 'premium') discount += 6.5;
    // 'user' role gets 0% discount
    
    // Newsletter subscriber bonus
    if (isNewsletterSubscriber) discount += 1.5;
    
    console.log('getDiscount: Final discount calculated:', discount);
    return discount;
  };

  const getRoleLabel = () => {
    switch (role) {
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
    isNewsletterSubscriber,
    loading,
    discount: getDiscount(),
    roleLabel: getRoleLabel(),
  };
}