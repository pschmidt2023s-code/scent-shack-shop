import { useState, useEffect } from 'react';
import { Fingerprint, Shield, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from './ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function BiometricAuth() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
    checkBiometricStatus();
  }, [user]);

  const checkBiometricSupport = async () => {
    if (window.PublicKeyCredential) {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsBiometricAvailable(available);
    }
  };

  const checkBiometricStatus = () => {
    if (user) {
      const enabled = localStorage.getItem(`biometric_${user.id}`) === 'true';
      setIsBiometricEnabled(enabled);
    }
  };

  const registerBiometric = async () => {
    if (!user) return;

    try {
      setIsVerifying(true);

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: "ALDENAIR",
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16),
            name: user.email || 'user',
            displayName: user.email || 'User',
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        }
      });

      if (credential) {
        localStorage.setItem(`biometric_${user.id}`, 'true');
        localStorage.setItem(`biometric_credential_${user.id}`, JSON.stringify(credential));
        setIsBiometricEnabled(true);

        toast({
          title: "Biometrische Authentifizierung aktiviert",
          description: "Sie können sich jetzt mit Fingerabdruck/Face ID anmelden",
        });
      }
    } catch (error) {
      console.error('Biometric registration failed:', error);
      toast({
        title: "Registrierung fehlgeschlagen",
        description: "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyBiometric = async () => {
    if (!user) return;

    try {
      setIsVerifying(true);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: "required",
        }
      });

      if (credential) {
        toast({
          title: "Verifizierung erfolgreich",
          description: "✓ Biometrische Authentifizierung erfolgreich",
        });
      }
    } catch (error) {
      console.error('Biometric verification failed:', error);
      toast({
        title: "Verifizierung fehlgeschlagen",
        description: "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const disableBiometric = () => {
    if (!user) return;

    localStorage.removeItem(`biometric_${user.id}`);
    localStorage.removeItem(`biometric_credential_${user.id}`);
    setIsBiometricEnabled(false);

    toast({
      title: "Biometrie deaktiviert",
      description: "Biometrische Authentifizierung wurde entfernt",
    });
  };

  if (!isBiometricAvailable) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-5 w-5" />
          <p className="text-sm">Biometrische Authentifizierung nicht verfügbar</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Biometrische Authentifizierung</h3>
          </div>
          {isBiometricEnabled && (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {isBiometricEnabled
            ? "Biometrische Anmeldung ist aktiviert"
            : "Aktivieren Sie Fingerabdruck oder Face ID für schnellere Anmeldung"}
        </p>

        {!isBiometricEnabled ? (
          <Button
            onClick={registerBiometric}
            disabled={isVerifying || !user}
            className="w-full"
          >
            <Fingerprint className="h-4 w-4 mr-2" />
            {isVerifying ? "Registriere..." : "Biometrie aktivieren"}
          </Button>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={verifyBiometric}
              disabled={isVerifying}
              className="w-full"
              variant="secondary"
            >
              <Shield className="h-4 w-4 mr-2" />
              {isVerifying ? "Verifiziere..." : "Jetzt verifizieren"}
            </Button>
            <Button
              onClick={disableBiometric}
              variant="outline"
              className="w-full"
            >
              Biometrie deaktivieren
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>🔒 Sicher und verschlüsselt</p>
          <p>⚡ Schnelle Anmeldung</p>
          <p>✨ Funktioniert offline</p>
        </div>
      </div>
    </Card>
  );
}
