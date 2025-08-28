import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Smartphone } from 'lucide-react';

interface TwoFactorVerificationProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  challengeId: string;
}

export function TwoFactorVerification({ 
  open, 
  onClose, 
  onVerified, 
  challengeId 
}: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Ungültiger Code",
        description: "Bitte geben Sie einen 6-stelligen Code ein.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.mfa.verify({
        factorId: challengeId,
        challengeId: challengeId,
        code: verificationCode
      });

      if (error) throw error;

      toast({
        title: "Erfolgreich angemeldet",
        description: "2FA-Verifizierung erfolgreich!",
      });
      
      onVerified();
    } catch (error: any) {
      console.error('Error verifying 2FA code:', error);
      toast({
        title: "Verifizierung fehlgeschlagen",
        description: "Bitte überprüfen Sie Ihren Code und versuchen Sie es erneut.",
        variant: "destructive",
      });
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyCode();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Zwei-Faktor-Authentifizierung
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Smartphone className="w-4 h-4" />
            <AlertDescription>
              Öffnen Sie Ihre Authenticator-App und geben Sie den aktuellen 6-stelligen Code ein.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="verification-code">Verifizierungscode</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={handleKeyPress}
              maxLength={6}
              className="text-center text-lg tracking-widest"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button 
              onClick={verifyCode}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1"
            >
              {loading ? 'Verifiziere...' : 'Verifizieren'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}