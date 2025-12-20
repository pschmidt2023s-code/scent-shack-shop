import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { validatePasswordStrength } from '@/lib/validation';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [passwordError, setPasswordError] = useState('');
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Fehler",
        description: "Die Passwörter stimmen nicht überein.",
        variant: "destructive",
      });
      return;
    }
    
    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      toast({
        title: "Passwort zu schwach",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Zurücksetzen');
      }
      
      setSuccess(true);
      toast({
        title: "Erfolgreich",
        description: "Ihr Passwort wurde erfolgreich geändert.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ungültiger Link</h2>
            <p className="text-muted-foreground mb-6">
              Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Link an.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Passwort geändert</h2>
            <p className="text-muted-foreground mb-6">
              Ihr Passwort wurde erfolgreich geändert. Sie können sich jetzt anmelden.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Neues Passwort festlegen</CardTitle>
          <CardDescription>
            Bitte geben Sie ein neues sicheres Passwort ein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">Neues Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mindestens 8 Zeichen"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                minLength={8}
                className="h-11"
                data-testid="input-new-password"
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
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Passwort wiederholen"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="h-11"
                data-testid="input-confirm-password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">Die Passwörter stimmen nicht überein</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={loading || password !== confirmPassword}
              data-testid="button-reset-password"
            >
              {loading ? 'Wird gespeichert...' : 'Passwort ändern'}
            </Button>
            
            <div className="text-center">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zur Startseite
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
