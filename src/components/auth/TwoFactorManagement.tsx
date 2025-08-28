import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, ShieldCheck, ShieldOff, Settings } from 'lucide-react';
import { TwoFactorSetup } from './TwoFactorSetup';

export function TwoFactorManagement() {
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMfaFactors();
  }, []);

  const loadMfaFactors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      setMfaFactors(data.totp || []);
    } catch (error: any) {
      console.error('Error loading MFA factors:', error);
      toast({
        title: "Fehler beim Laden",
        description: "2FA-Einstellungen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async (factorId: string) => {
    try {
      setDisabling(true);
      const { error } = await supabase.auth.mfa.unenroll({
        factorId
      });

      if (error) throw error;

      toast({
        title: "2FA deaktiviert",
        description: "Zwei-Faktor-Authentifizierung wurde erfolgreich deaktiviert.",
      });
      
      await loadMfaFactors();
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
    loadMfaFactors();
    toast({
      title: "2FA aktiviert",
      description: "Zwei-Faktor-Authentifizierung wurde erfolgreich eingerichtet.",
    });
  };

  const has2FA = mfaFactors.length > 0;

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
                  Aktivieren Sie 2FA für zusätzliche Kontosicherheit.
                </AlertDescription>
              </Alert>

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
                <Button onClick={() => setSetupOpen(true)}>
                  Einrichten
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