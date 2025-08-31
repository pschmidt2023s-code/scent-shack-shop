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
      
      // Wait a bit to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get fresh session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session for 2FA setup:', session);
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Sitzungsfehler: ' + sessionError.message);
      }
      
      if (!session || !session.user) {
        console.error('No valid session found');
        throw new Error('Keine gültige Sitzung gefunden. Bitte melden Sie sich erneut an.');
      }
      
      console.log('Attempting MFA enrollment for user:', session.user.id);
      
      // Try to enroll with a unique friendly name to avoid conflicts
      const uniqueName = `totp_${Date.now()}`;
      
      let enrollResult;
      try {
        enrollResult = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: uniqueName
        });
      } catch (initialError: any) {
        console.log('Initial enrollment failed, trying cleanup:', initialError);
        
        if (initialError.message?.includes('friendly name') || initialError.code === 'mfa_factor_name_conflict') {
          // Aggressive cleanup - try to remove any existing factors
          console.log('Attempting aggressive factor cleanup...');
          
          // Try multiple cleanup approaches
          const userFactors = session.user.factors || [];
          console.log('User factors from session:', userFactors);
          
          // Try to remove factors from user object
          for (const factor of userFactors) {
            try {
              console.log('Removing factor from user object:', factor.id);
              await supabase.auth.mfa.unenroll({ factorId: factor.id });
            } catch (err) {
              console.warn('Could not remove factor via user object:', err);
            }
          }
          
          // Also try listFactors approach
          try {
            const { data: factorsList } = await supabase.auth.mfa.listFactors();
            if (factorsList?.totp) {
              for (const factor of factorsList.totp) {
                try {
                  console.log('Removing factor from listFactors:', factor.id);
                  await supabase.auth.mfa.unenroll({ factorId: factor.id });
                } catch (err) {
                  console.warn('Could not remove factor via listFactors:', err);
                }
              }
            }
          } catch (err) {
            console.warn('ListFactors cleanup failed:', err);
          }
          
          // Force session refresh
          await supabase.auth.refreshSession();
          
          // Wait and try again
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Try enrollment again with different name
          const retryName = `totp_retry_${Date.now()}`;
          enrollResult = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName: retryName
          });
        } else {
          throw initialError;
        }
      }

      console.log('MFA enrollment result:', enrollResult);

      if (enrollResult.error) {
        console.error('MFA enrollment error:', enrollResult.error);
        throw enrollResult.error;
      }

      const { data } = enrollResult;
      if (!data || !data.totp) {
        throw new Error('Ungültige Antwort vom 2FA-Service');
      }

      setFactorId(data.id);
      setSecret(data.totp.secret);
      
      // Handle QR code - Extract pure SVG content
      const qrCodeSvg = data.totp.qr_code;
      
      if (qrCodeSvg) {
        // Extract SVG content if it's in data URL format
        let svgContent = qrCodeSvg;
        if (qrCodeSvg.startsWith('data:image/svg+xml')) {
          // Remove data URL prefix and decode
          const base64Part = qrCodeSvg.split(',')[1];
          if (base64Part) {
            try {
              svgContent = decodeURIComponent(base64Part);
            } catch (e) {
              // Fallback to original content
              svgContent = qrCodeSvg.replace(/^data:image\/svg\+xml[^,]*,/, '');
            }
          } else {
            // Remove prefix without base64
            svgContent = qrCodeSvg.replace(/^data:image\/svg\+xml[^,]*,/, '');
          }
        }
        
        // Ensure it's valid SVG
        if (svgContent.includes('<svg')) {
          setQrCode(svgContent);
        } else {
          console.warn('Invalid SVG content');
          setQrCode('');
        }
      } else {
        console.warn('No QR code received');
        setQrCode('');
      }
      
    } catch (error: any) {
      console.error('Error setting up 2FA:', error);
      toast({
        title: "2FA-Setup fehlgeschlagen",
        description: error.message || "Unbekannter Fehler beim 2FA-Setup. Bitte versuchen Sie es später erneut.",
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

            {qrCode ? (
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="font-semibold">QR-Code scannen</h3>
                  <div className="flex justify-center">
                    <div 
                      className="qr-code-container max-w-[200px] max-h-[200px] inline-block"
                      ref={(el) => {
                        if (el && qrCode) {
                          // Safely render SVG content
                          try {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(qrCode, 'image/svg+xml');
                            const svg = doc.querySelector('svg');
                            if (svg) {
                              // Clear existing content
                              el.innerHTML = '';
                              // Clone and append the SVG safely
                              el.appendChild(svg.cloneNode(true));
                            }
                          } catch (error) {
                            console.error('Error rendering QR code:', error);
                            el.textContent = 'QR-Code konnte nicht angezeigt werden';
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scannen Sie diesen QR-Code mit Ihrer Authenticator-App
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <Smartphone className="w-4 h-4" />
                <AlertDescription>
                  QR-Code konnte nicht generiert werden. Verwenden Sie den manuellen Secret unten.
                </AlertDescription>
              </Alert>
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