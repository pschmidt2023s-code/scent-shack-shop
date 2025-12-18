import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface ReferralPartner {
  id: string;
  partnerCode: string;
  commissionRate: number;
  fullName?: string;
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
      const response = await fetch(`/api/partners/validate/${code.toUpperCase()}`);
      
      if (!response.ok) {
        setPartner(null);
        return;
      }

      const partnerData = await response.json();
      setPartner(partnerData);
      
      const partnerName = partnerData.fullName || 'Partner';
      toast.success(`Willkommen! Sie wurden von ${partnerName} empfohlen.`);
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
