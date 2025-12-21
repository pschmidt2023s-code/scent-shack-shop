import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'aldenair_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'aldenair_cookie_preferences';

export function useCookieConsent() {
  const openCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('openCookieSettings'));
  };
  
  const getPreferences = (): CookiePreferences => {
    const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (saved) return JSON.parse(saved);
    return { essential: true, analytics: false, marketing: false };
  };
  
  return { openCookieSettings, getPreferences };
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    let timer: ReturnType<typeof setTimeout> | null = null;
    
    if (!consent) {
      timer = setTimeout(() => setShowBanner(true), 1000);
    } else {
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
    
    const handleOpenSettings = () => {
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
      setShowSettings(true);
      setShowBanner(true);
    };
    
    window.addEventListener('openCookieSettings', handleOpenSettings);
    
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('openCookieSettings', handleOpenSettings);
    };
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, new Date().toISOString());
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({ essential: true, analytics: true, marketing: true });
  };

  const acceptEssential = () => {
    saveConsent({ essential: true, analytics: false, marketing: false });
  };

  const saveSettings = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center sm:items-end justify-center p-4 pb-20 sm:pb-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl">
        <Card className="shadow-2xl border-2" data-testid="card-cookie-consent">
          <CardContent className="p-6">
            {!showSettings ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Cookie className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Cookie-Einstellungen</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
                      Einige Cookies sind technisch notwendig, andere helfen uns, die Website zu verbessern.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Weitere Informationen finden Sie in unserer{' '}
                      <Link to="/privacy" className="text-primary hover:underline">Datenschutzerklärung</Link>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowSettings(true)}
                    data-testid="button-cookie-settings"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Einstellungen
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={acceptEssential}
                    data-testid="button-cookie-essential"
                  >
                    Nur notwendige
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={acceptAll}
                    data-testid="button-cookie-accept-all"
                  >
                    Alle akzeptieren
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Cookie-Einstellungen anpassen</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <Label className="font-medium">Notwendige Cookies</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Diese Cookies sind für die Grundfunktionen der Website erforderlich (z.B. Warenkorb, Anmeldung).
                      </p>
                    </div>
                    <Switch checked disabled data-testid="switch-cookie-essential" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <Label className="font-medium">Analyse-Cookies</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Helfen uns zu verstehen, wie Besucher unsere Website nutzen, um sie zu verbessern.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                      data-testid="switch-cookie-analytics"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <Label className="font-medium">Marketing-Cookies</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Werden verwendet, um Werbung relevanter für Sie zu gestalten.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.marketing}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, marketing: checked })}
                      data-testid="switch-cookie-marketing"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowSettings(false)}
                    data-testid="button-cookie-back"
                  >
                    Zurück
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={saveSettings}
                    data-testid="button-cookie-save"
                  >
                    Einstellungen speichern
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
