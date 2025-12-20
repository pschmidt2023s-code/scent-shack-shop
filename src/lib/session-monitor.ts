/**
 * Enhanced Session Monitoring and Security
 */


interface SessionMonitorConfig {
  warningTimeoutMs: number; // When to show warning before expiry
  idleTimeoutMs: number; // Max idle time before logout
  checkIntervalMs: number; // How often to check session status
}

class SessionMonitor {
  private config: SessionMonitorConfig;
  private warningShown: boolean = false;
  private lastActivity: number = Date.now();
  private checkInterval: NodeJS.Timeout | null = null;
  private warningCallback?: () => void;
  private expiredCallback?: () => void;

  constructor(config: Partial<SessionMonitorConfig> = {}) {
    this.config = {
      warningTimeoutMs: 5 * 60 * 1000, // 5 minutes warning
      idleTimeoutMs: 30 * 60 * 1000, // 30 minutes idle timeout
      checkIntervalMs: 60 * 1000, // Check every minute
      ...config
    };
  }

  start(warningCallback: () => void, expiredCallback: () => void): void {
    this.warningCallback = warningCallback;
    this.expiredCallback = expiredCallback;
    this.lastActivity = Date.now();
    this.warningShown = false;

    // Set up activity listeners
    this.setupActivityListeners();

    // Start periodic session checks
    this.checkInterval = setInterval(() => {
      this.checkSessionStatus();
    }, this.config.checkIntervalMs);

    // Check session validity with Supabase
    this.checkSupabaseSession();
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.removeActivityListeners();
  }

  extendSession(): void {
    this.lastActivity = Date.now();
    this.warningShown = false;
  }

  private setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, { passive: true });
    });
  }

  private removeActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity);
    });
  }

  private handleActivity = (): void => {
    this.extendSession();
  };

  private checkSessionStatus(): void {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;

    // Check if session should expire
    if (timeSinceLastActivity >= this.config.idleTimeoutMs) {
      this.expiredCallback?.();
      return;
    }

    // Check if warning should be shown
    const timeUntilExpiry = this.config.idleTimeoutMs - timeSinceLastActivity;
    if (timeUntilExpiry <= this.config.warningTimeoutMs && !this.warningShown) {
      this.warningShown = true;
      this.warningCallback?.();
    }
  }

  private async checkSupabaseSession(): Promise<void> {
    try {
      
      if (error || !session) {
        console.warn('Invalid Supabase session detected');
        this.expiredCallback?.();
        return;
      }

      // Check if token is expired
      const expiresAt = session.expires_at;
      if (expiresAt && expiresAt * 1000 < Date.now()) {
        console.warn('Supabase session expired');
        this.expiredCallback?.();
      }
    } catch (error) {
      console.error('Error checking Supabase session:', error);
    }
  }

  getRemainingTime(): number {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;
    return Math.max(0, this.config.idleTimeoutMs - timeSinceLastActivity);
  }

  getWarningTime(): number {
    return this.config.warningTimeoutMs;
  }
}

// Enhanced Security Monitoring
class SecurityEventMonitor {
  private suspiciousActivityCount: number = 0;
  private lastSecurityEvent: number = 0;
  private readonly MAX_SUSPICIOUS_EVENTS = 5;
  private readonly RESET_WINDOW_MS = 60 * 60 * 1000; // 1 hour

  logSecurityEvent(eventType: string, details: any): void {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - this.lastSecurityEvent > this.RESET_WINDOW_MS) {
      this.suspiciousActivityCount = 0;
    }

    this.suspiciousActivityCount++;
    this.lastSecurityEvent = now;

    console.warn('Security event detected:', {
      type: eventType,
      count: this.suspiciousActivityCount,
      details,
      timestamp: new Date().toISOString()
    });

    // Trigger lockdown if too many suspicious events
    if (this.suspiciousActivityCount >= this.MAX_SUSPICIOUS_EVENTS) {
      this.triggerSecurityLockdown();
    }
  }

  private triggerSecurityLockdown(): void {
    console.error('Security lockdown triggered due to suspicious activity');
    
    // Force logout
      window.location.href = '/auth?reason=security_lockdown';
    });
  }

  checkForSuspiciousActivity(userAgent: string, currentIP?: string): void {
    // Check for automated requests
    const suspiciousUserAgents = [
      'bot', 'crawler', 'spider', 'scraper', 'automated'
    ];
    
    if (suspiciousUserAgents.some(pattern => 
      userAgent.toLowerCase().includes(pattern)
    )) {
      this.logSecurityEvent('suspicious_user_agent', { userAgent });
    }

    // Additional security checks could be added here
  }
}

// Export instances
export const sessionMonitor = new SessionMonitor();
export const securityEventMonitor = new SecurityEventMonitor();