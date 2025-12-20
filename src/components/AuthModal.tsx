
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, UserPlus, AlertCircle, Shield, ArrowLeft, Mail } from 'lucide-react';
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sanitizedEmail = sanitizeInput(email);
    const emailValidation = validateEmail(sanitizedEmail);
    
    if (!emailValidation.isValid) {
      toast({
        title: "Ungültige E-Mail",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sanitizedEmail }),
      });
      
      setResetEmailSent(true);
      toast({
        title: "E-Mail gesendet",
        description: "Falls ein Konto mit dieser E-Mail existiert, erhalten Sie eine Nachricht mit weiteren Anweisungen.",
      });
    } catch (error) {
      toast({
        title: "E-Mail gesendet",
        description: "Falls ein Konto mit dieser E-Mail existiert, erhalten Sie eine Nachricht mit weiteren Anweisungen.",
      });
      setResetEmailSent(true);
    } finally {
      setLoading(false);
    }
  };

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
    setShowForgotPassword(false);
    setResetEmailSent(false);
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
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          
          {showForgotPassword ? (
            <div className="relative p-6">
              <button 
                type="button"
                onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); }}
                className="absolute top-6 left-6 p-2 rounded-full hover:bg-muted transition-colors"
                data-testid="button-back-to-login"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <DialogHeader className="text-center space-y-2 pt-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-2">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <DialogTitle className="text-xl font-semibold">
                  {resetEmailSent ? 'E-Mail gesendet' : 'Passwort zurücksetzen'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {resetEmailSent 
                    ? 'Prüfen Sie Ihren Posteingang für weitere Anweisungen.' 
                    : 'Geben Sie Ihre E-Mail-Adresse ein, um Ihr Passwort zurückzusetzen.'
                  }
                </p>
              </DialogHeader>
              
              {resetEmailSent ? (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Falls ein Konto mit dieser E-Mail existiert, erhalten Sie in Kürze eine Nachricht mit Anweisungen zum Zurücksetzen Ihres Passworts.
                    </p>
                  </div>
                  <Button 
                    className="w-full h-11"
                    onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); }}
                    data-testid="button-back-to-login-after-reset"
                  >
                    Zurück zur Anmeldung
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="mt-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-sm font-medium">E-Mail-Adresse</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="ihre@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                      data-testid="input-reset-email"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading} data-testid="button-reset-submit">
                    {loading ? 'Wird gesendet...' : 'Link senden'}
                  </Button>
                </form>
              )}
            </div>
          ) : (
          <>
          <div className="relative p-6 pb-4">
            <DialogHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-2">
                <User className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-xl font-semibold">Willkommen bei ALDENAIR</DialogTitle>
              <p className="text-sm text-muted-foreground">Melden Sie sich an oder erstellen Sie ein Konto</p>
            </DialogHeader>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50">
                <TabsTrigger 
                  value="login" 
                  className="flex items-center justify-center gap-2 h-10 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
                  data-testid="tab-login"
                >
                  <User className="w-4 h-4" />
                  <span>Anmelden</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="flex items-center justify-center gap-2 h-10 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
                  data-testid="tab-register"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrieren</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="login" className="mt-0 p-6 pt-6">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">E-Mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="ihre@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                    data-testid="input-login-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">Passwort</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Ihr Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                    data-testid="input-login-password"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading} data-testid="button-login-submit">
                  {loading ? 'Anmelden...' : 'Anmelden'}
                </Button>
                <div className="text-center">
                  <button 
                    type="button" 
                    className="text-sm text-primary hover:underline"
                    onClick={() => setShowForgotPassword(true)}
                    data-testid="button-forgot-password"
                  >
                    Passwort oder E-Mail vergessen?
                  </button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="mt-0 p-6 pt-6">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-sm font-medium">Vollständiger Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Max Mustermann"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11"
                    data-testid="input-register-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium">E-Mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="ihre@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                    data-testid="input-register-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium">Passwort</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Mindestens 8 Zeichen"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    minLength={8}
                    className="h-11"
                    data-testid="input-register-password"
                  />
                  {password && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              passwordStrength === 'strong' ? 'w-full bg-green-500' :
                              passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                              'w-1/3 bg-red-500'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                          {passwordStrength === 'strong' ? 'Stark' : passwordStrength === 'medium' ? 'Mittel' : 'Schwach'}
                        </span>
                      </div>
                      {passwordError && (
                        <div className="flex items-start gap-1.5 text-xs text-destructive">
                          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>{passwordError}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading} data-testid="button-register-submit">
                  {loading ? 'Registrieren...' : 'Konto erstellen'}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground pt-2">
                  Mit der Registrierung stimmen Sie unseren{' '}
                  <a href="/agb" className="text-primary hover:underline">AGB</a>
                  {' '}und{' '}
                  <a href="/datenschutz" className="text-primary hover:underline">Datenschutzrichtlinien</a>
                  {' '}zu.
                </p>
              </form>
            </TabsContent>
          </Tabs>
          </>
          )}
        </div>
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
