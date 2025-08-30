import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferralPartner {
  id: string;
  partner_code: string;
  commission_rate: number;
  profiles?: {
    full_name: string;
  };
}

export function useReferralCode() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState<string>('');
  const [partner, setPartner] = useState<ReferralPartner | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode && refCode !== referralCode) {
      setReferralCode(refCode);
      validateReferralCode(refCode);
    }
  }, [searchParams]);

  const validateReferralCode = async (code: string) => {
    if (!code) return;

    setLoading(true);
    try {
      const { data: partnerData, error } = await supabase
        .from('partners')
        .select(`
          id,
          partner_code,
          commission_rate,
          profiles!partners_user_id_fkey(full_name)
        `)
        .eq('partner_code', code.toUpperCase())
        .eq('status', 'approved')
        .single();

      if (error || !partnerData) {
        console.log('Invalid referral code:', code);
        setPartner(null);
        // Don't show error toast as this might be confusing for users
        return;
      }

      setPartner(partnerData as any);
      
      // Show welcome message with partner info
      const partnerName = (partnerData.profiles as any)?.full_name || 'Partner';
      toast.success(`Willkommen! Sie wurden von ${partnerName} empfohlen.`);
      
      console.log('Valid referral partner:', partnerData);
    } catch (error) {
      console.error('Error validating referral code:', error);
      setPartner(null);
    } finally {
      setLoading(false);
    }
  };

  const clearReferralCode = () => {
    setReferralCode('');
    setPartner(null);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('ref');
    setSearchParams(newSearchParams);
  };

  return {
    referralCode,
    partner,
    loading,
    clearReferralCode,
    hasValidReferral: !!partner
  };
}