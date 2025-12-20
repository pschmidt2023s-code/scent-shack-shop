import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ShieldCheck, ShieldOff, Settings, AlertTriangle } from 'lucide-react';
import { TwoFactorSetup } from './TwoFactorSetup';

export function TwoFactorManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const { toast } = useToast();

  // Get factors directly from user object instead of mfa.listFactors()
  const mfaFactors = user?.factors || [];
  
  // Debug logging
  console.log('User object:', user);
  console.log('User factors:', user?.factors);
  console.log('MFA Factors array:', mfaFactors);
  
  useEffect(() => {
    // Simulate loading for a moment to show loading state
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const cleanupAllFactors = async () => {
    try {
      setCleaning(true);
      
      // Clean up factors from user.factors array
      console.log('Cleaning up factors from user object:', mfaFactors);
      
      for (const factor of mfaFactors) {
        try {
          console.log('Removing factor:', factor.id);
            factorId: factor.id
          });
          
          if (unenrollError) {
            console.error('Error removing factor:', factor.id, unenrollError);
          } else {
            console.log('Successfully removed factor:', factor.id);
          }
        } catch (err) {
          console.error('Failed to remove factor:', factor.id, err);
        }
      }
      
      toast({
        title: "Bereinigung abgeschlossen",
        description: "Alle 2FA-Faktoren wurden entfernt. Sie können jetzt neu einrichten.",
      });
      
      // Force refresh user data
      
    } catch (error: any) {
      console.error('Error cleaning up factors:', error);
      toast({
        title: "Bereinigung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCleaning(false);
    }
  };

  const disableTwoFactor = async (factorId: string) => {
    try {
      setDisabling(true);
        factorId
      });

      if (error) throw error;

      toast({
        title: "2FA deaktiviert",
        description: "Zwei-Faktor-Authentifizierung wurde erfolgreich deaktiviert.",
      });
      
      // Force refresh user data
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Deaktivierung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDisabling(false);
    }
  };

  const handleSetupComplete = () => {
    // Force refresh user data
    toast({
      title: "2FA aktiviert",
      description: "Zwei-Faktor-Authentifizierung wurde erfolgreich eingerichtet.",
    });
  };

  // Only consider 2FA active if factors are verified
  const has2FA = mfaFactors.some(factor => factor.status === 'verified');

  console.log('Current MFA state:', { 
    mfaFactors, 
    has2FA, 
    factorCount: mfaFactors.length,
    factorStatuses: mfaFactors.map(f => f.status)
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Zwei-Faktor-Authentifizierung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Lade 2FA-Einstellungen...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Zwei-Faktor-Authentifizierung
            {has2FA && <Badge variant="secondary" className="ml-2">Aktiv</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {has2FA ? (
            <div className="space-y-4">
              <Alert>
                <ShieldCheck className="w-4 h-4" />
                <AlertDescription>
                  Ihr Konto ist durch Zwei-Faktor-Authentifizierung geschützt. 
                  Sie benötigen sowohl Ihr Passwort als auch einen Code aus Ihrer Authenticator-App zum Anmelden.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                {mfaFactors.map((factor) => (
                  <div key={factor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">TOTP Authenticator</p>
                        <p className="text-sm text-muted-foreground">
                          Erstellt am {new Date(factor.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => disableTwoFactor(factor.id)}
                      disabled={disabling}
                    >
                      {disabling ? 'Deaktiviere...' : 'Deaktivieren'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <ShieldOff className="w-4 h-4" />
                <AlertDescription>
                  Zwei-Faktor-Authentifizierung ist nicht aktiviert. 
                  {mfaFactors.length > 0 && " Es wurden kaputte 2FA-Faktoren erkannt - bitte bereinigen Sie diese zuerst."}
                </AlertDescription>
              </Alert>

              {/* Show cleanup option if there are factors but they're not working */}
              {mfaFactors.length > 0 && (
                <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/50 bg-destructive/5">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="font-medium text-destructive">Kaputte 2FA-Faktoren erkannt</p>
                      <p className="text-sm text-muted-foreground">
                        {mfaFactors.length} defekte Faktor(en) blockieren die Einrichtung
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={cleanupAllFactors}
                    disabled={cleaning}
                  >
                    {cleaning ? 'Bereinige...' : 'Bereinigen'}
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">2FA einrichten</p>
                    <p className="text-sm text-muted-foreground">
                      Schützen Sie Ihr Konto mit einer zusätzlichen Sicherheitsebene
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setSetupOpen(true)}
                  disabled={mfaFactors.length > 0}
                >
                  {mfaFactors.length > 0 ? 'Zuerst bereinigen' : 'Einrichten'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TwoFactorSetup
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        onSetupComplete={handleSetupComplete}
      />
    </>
  );
}