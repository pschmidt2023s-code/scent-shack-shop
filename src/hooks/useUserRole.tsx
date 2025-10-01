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

        // For now, we'll simulate role logic based on user metadata or order history
        // In a real implementation, you'd have proper role assignment logic
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
        // Check if user has admin role in database
        if (roleData?.role === 'admin') {
          userRole = 'premium';
        } else {
          // Check newsletter subscription for loyal status
          if (isSubscriber) {
            userRole = 'loyal';
          }
          
          // TODO: Add logic for premium role based on order history, spending, etc.
          // For now, users start as 'user' and can become 'loyal' through newsletter
          // Premium status would be assigned through admin or based on purchase history
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