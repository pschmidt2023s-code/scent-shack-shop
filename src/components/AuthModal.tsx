
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, UserPlus, AlertCircle, Shield } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { sanitizeInput, validatePasswordStrength, validateEmail } from '@/lib/validation';
import { authRateLimiter } from '@/lib/security';
import { logAuthAttempt } from '@/lib/security-monitor';
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';
import { TwoFactorVerification } from '@/components/auth/TwoFactorVerification';

interface AuthModalProps {
  children: React.ReactNode;
}

export function AuthModal({ children }: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [passwordError, setPasswordError] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showTwoFactorVerification, setShowTwoFactorVerification] = useState(false);
  const [mfaChallengeId, setMfaChallengeId] = useState('');
  const [setup2FAAfterSignup, setSetup2FAAfterSignup] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const clientId = `auth-signin-${Date.now().toString(36)}`;
    if (!authRateLimiter.isAllowed(clientId)) {
      toast({
        title: "Zu viele Anmeldeversuche",
        description: "Bitte warten Sie 15 Minuten, bevor Sie es erneut versuchen.",
        variant: "destructive",
      });
      return;
    }

    // Sanitize and validate inputs
    const sanitizedEmail = sanitizeInput(email);
    const emailValidation = validateEmail(sanitizedEmail);
    
    if (!emailValidation.isValid) {
      toast({
        title: "Ungültige E-Mail",
        description: emailValidation.message || "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast({
        title: "Passwort erforderlich",
        description: "Bitte geben Sie Ihr Passwort ein (mindestens 6 Zeichen).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const { error, needsMfa, challengeId } = await signIn(sanitizedEmail, password);
    
    // Log authentication attempt for security monitoring
    await logAuthAttempt(sanitizedEmail, !error && !needsMfa, 'password');
    
    if (needsMfa && challengeId) {
      setMfaChallengeId(challengeId);
      setShowTwoFactorVerification(true);
    } else if (error) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen zurück!",
      });
      setOpen(false);
      resetForm();
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const clientId = `auth-signup-${Date.now().toString(36)}`;
    if (!authRateLimiter.isAllowed(clientId)) {
      toast({
        title: "Zu viele Registrierungsversuche",
        description: "Bitte warten Sie 15 Minuten, bevor Sie es erneut versuchen.",
        variant: "destructive",
      });
      return;
    }

    // Sanitize and validate inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedFullName = sanitizeInput(fullName);
    
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.isValid) {
      toast({
        title: "Ungültige E-Mail",
        description: emailValidation.message || "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    if (!sanitizedFullName.trim() || sanitizedFullName.length < 2) {
      toast({
        title: "Name erforderlich",
        description: "Bitte geben Sie Ihren vollständigen Namen ein (mindestens 2 Zeichen).",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message || 'Password is too weak');
      return;
    }
    
    setLoading(true);
    
    const { error } = await signUp(
      sanitizedEmail, 
      password, 
      sanitizedFullName
    );
    
    // Log registration attempt for security monitoring
    await logAuthAttempt(sanitizedEmail, !error, 'registration');
    
    if (error) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registrierung erfolgreich",
        description: "Bitte überprüfen Sie Ihre E-Mails zur Bestätigung. Nach der Bestätigung können Sie sich anmelden und 2FA einrichten.",
      });
      setOpen(false);
      resetForm();
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPasswordError('');
    setPasswordStrength('weak');
    setSetup2FAAfterSignup(false);
    setShowTwoFactorSetup(false);
    setShowTwoFactorVerification(false);
    setMfaChallengeId('');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError('');
    const validation = validatePasswordStrength(value);
    setPasswordStrength(validation.strength);
    if (!validation.isValid && value.length > 0) {
      setPasswordError(validation.message || '');
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Anmelden oder Registrieren</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Anmelden
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Registrieren
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-Mail</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Passwort</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Anmelden...' : 'Anmelden'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Vollständiger Name</Label>
                <Input
                  id="register-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">E-Mail</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Passwort</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  minLength={8}
                />
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      <span className={`text-xs ${getPasswordStrengthColor()}`}>
                        Password strength: {passwordStrength}
                      </span>
                    </div>
                    {passwordError && (
                      <p className="text-xs text-red-600">{passwordError}</p>
                    )}
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registrieren...' : 'Registrieren'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      <TwoFactorVerification
        open={showTwoFactorVerification}
        onClose={() => {
          setShowTwoFactorVerification(false);
          resetForm();
        }}
        onVerified={() => {
          setShowTwoFactorVerification(false);
          setOpen(false);
          resetForm();
          toast({
            title: "Erfolgreich angemeldet",
            description: "2FA-Verifizierung erfolgreich!",
          });
        }}
        challengeId={mfaChallengeId}
      />
    </Dialog>
  );
}
