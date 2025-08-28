import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Copy, Check, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';

interface TwoFactorSetupProps {
  open: boolean;
  onClose: () => void;
  onSetupComplete: () => void;
}

export function TwoFactorSetup({ open, onClose, onSetupComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setupTwoFactor();
    }
  }, [open]);

  const setupTwoFactor = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Sie müssen angemeldet sein, um 2FA einzurichten. Bitte melden Sie sich erst an.');
      }
      
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });

      if (error) throw error;

      setFactorId(data.id);
      setSecret(data.totp.secret);
      
      // Generate QR code
      const qrCodeUrl = data.totp.qr_code;
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);
      setQrCode(qrCodeDataUrl);
      
    } catch (error: any) {
      console.error('Error setting up 2FA:', error);
      toast({
        title: "2FA-Setup fehlgeschlagen",
        description: error.message || "Bitte melden Sie sich erst vollständig an.",
        variant: "destructive",
      });
      onClose(); // Close modal on error
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
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
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verificationCode
      });

      if (error) throw error;

      toast({
        title: "2FA erfolgreich aktiviert",
        description: "Zwei-Faktor-Authentifizierung wurde für Ihr Konto aktiviert.",
      });
      
      onSetupComplete();
      onClose();
    } catch (error: any) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: "Verifizierung fehlgeschlagen",
        description: "Bitte überprüfen Sie Ihren Code und versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
      toast({
        title: "Secret kopiert",
        description: "Der Secret wurde in die Zwischenablage kopiert.",
      });
    } catch (error) {
      toast({
        title: "Kopieren fehlgeschlagen",
        description: "Secret konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Zwei-Faktor-Authentifizierung einrichten
          </DialogTitle>
        </DialogHeader>

        {step === 'setup' && (
          <div className="space-y-6">
            <Alert>
              <Smartphone className="w-4 h-4" />
              <AlertDescription>
                Installieren Sie eine Authenticator-App wie Google Authenticator oder Authy auf Ihrem Smartphone.
              </AlertDescription>
            </Alert>

            {qrCode && (
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="font-semibold">QR-Code scannen</h3>
                  <img src={qrCode} alt="QR Code" className="mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Scannen Sie diesen QR-Code mit Ihrer Authenticator-App
                  </p>
                </CardContent>
              </Card>
            )}

            {secret && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Manueller Secret</h3>
                  <p className="text-sm text-muted-foreground">
                    Falls Sie den QR-Code nicht scannen können, geben Sie diesen Secret manuell ein:
                  </p>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded font-mono text-sm">
                    <span className="flex-1 break-all">{secret}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={copySecret}
                      className="shrink-0"
                    >
                      {secretCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={() => setStep('verify')} 
              className="w-full"
              disabled={!secret}
            >
              Weiter zur Verifizierung
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein, um 2FA zu aktivieren.
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
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('setup')}
                className="flex-1"
              >
                Zurück
              </Button>
              <Button 
                onClick={verifyAndEnable}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1"
              >
                {loading ? 'Verifiziere...' : '2FA aktivieren'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}