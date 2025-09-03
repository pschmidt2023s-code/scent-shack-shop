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
        // Even for non-authenticated users, provide some discount
        setRole('premium'); // Set premium for testing
        setIsNewsletterSubscriber(false);
        setLoading(false);
        return;
      }

      try {
        // Debug logs for troubleshooting
        console.log('useUserRole: Fetching user role for user:', user?.id);

        // Check user role from user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError && roleError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error fetching user role:', roleError);
        }

        // For now, we'll simulate role logic based on user metadata or order history
        // In a real implementation, you'd have proper role assignment logic
        let userRole: UserRole = 'user';
        
        // Check newsletter subscription
        const { data: newsletterData, error: newsletterError } = await supabase
          .from('newsletter_subscriptions')
          .select('id')
          .eq('email', user.email)
          .eq('is_active', true)
          .single();

        const isSubscriber = !newsletterError && !!newsletterData;
        console.log('useUserRole: Newsletter subscriber?', isSubscriber);
        setIsNewsletterSubscriber(isSubscriber);

        // Simplified role logic - in production you'd have proper business logic
        // For demonstration, we'll assign roles based on order count or other criteria
        // Set all authenticated users to premium for testing discounts
        userRole = 'premium';
        
        console.log('useUserRole: Final role assigned:', userRole);
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
    
    // Newsletter subscriber discount
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