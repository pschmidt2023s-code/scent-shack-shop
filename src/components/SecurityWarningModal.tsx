import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Clock, AlertTriangle } from 'lucide-react';
import { sessionMonitor } from '@/lib/session-monitor';

interface SecurityWarningModalProps {
  isOpen: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
}

export default function SecurityWarningModal({ 
  isOpen, 
  onExtendSession, 
  onLogout 
}: SecurityWarningModalProps) {
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const updateTimer = () => {
      const remaining = sessionMonitor.getRemainingTime();
      setRemainingTime(Math.ceil(remaining / 1000)); // Convert to seconds
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isExpired = remainingTime <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            {isExpired ? (
              <>
                <AlertTriangle className="w-5 h-5" />
                Sitzung abgelaufen
              </>
            ) : (
              <>
                <Clock className="w-5 h-5" />
                Sitzungswarnung
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isExpired
              ? "Ihre Sitzung ist aus Sicherheitsgründen abgelaufen."
              : "Ihre Sitzung läuft bald ab. Möchten Sie sie verlängern?"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isExpired && (
            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                Verbleibende Zeit: <strong>{formatTime(remainingTime)}</strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {isExpired ? (
              <Button 
                onClick={onLogout} 
                className="w-full"
              >
                Zur Anmeldung
              </Button>
            ) : (
              <>
                <Button 
                  onClick={onExtendSession} 
                  className="w-full"
                >
                  Sitzung verlängern
                </Button>
                <Button 
                  onClick={onLogout} 
                  variant="outline" 
                  className="w-full"
                >
                  Abmelden
                </Button>
              </>
            )}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <Shield className="w-3 h-3 inline mr-1" />
            Diese Sicherheitsmaßnahme schützt Ihre Daten vor unbefugtem Zugriff.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}