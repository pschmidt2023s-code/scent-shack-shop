/**
 * Enhanced security monitoring and audit logging
 */
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  userId?: string;
  sessionId?: string;
  eventType: 'auth_attempt' | 'data_access' | 'admin_action' | 'suspicious_activity' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
}

// Enhanced audit logger
export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private eventQueue: SecurityEvent[] = [];
  private isProcessing = false;

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // Log security events with automatic batching
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const enhancedEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
    };

    // Add to queue for batch processing
    this.eventQueue.push(enhancedEvent);

    // Process immediately for critical events
    if (event.severity === 'critical') {
      await this.processQueue();
    } else if (!this.isProcessing) {
      // Batch process other events
      setTimeout(() => this.processQueue(), 1000);
    }

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', enhancedEvent);
    }
  }

  // Process the event queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;
    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Send events to secure logging endpoint or local storage
      await this.persistEvents(events);
    } catch (error) {
      console.error('Failed to persist security events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    } finally {
      this.isProcessing = false;
    }
  }

  // Persist events securely
  private async persistEvents(events: SecurityEvent[]): Promise<void> {
    // For production: send to secure logging service
    // For now: store in sessionStorage as fallback
    try {
      const existingEvents = JSON.parse(sessionStorage.getItem('security_events') || '[]');
      const allEvents = [...existingEvents, ...events].slice(-100); // Keep last 100 events
      sessionStorage.setItem('security_events', JSON.stringify(allEvents));
    } catch (error) {
      console.error('Failed to persist security events:', error);
    }
  }

  // Get client IP (limited in browser context)
  private async getClientIP(): Promise<string | undefined> {
    try {
      // In production, this would come from server headers
      return 'client';
    } catch {
      return undefined;
    }
  }

  // Get or create session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('security_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('security_session_id', sessionId);
    }
    return sessionId;
  }

  // Monitor suspicious patterns
  async detectSuspiciousActivity(userId: string, activityType: string): Promise<void> {
    const key = `activity_${userId}_${activityType}`;
    const now = Date.now();
    
    // Get recent activity from memory/storage
    const recentActivity = JSON.parse(sessionStorage.getItem(key) || '[]') as number[];
    const windowMs = 5 * 60 * 1000; // 5 minutes
    
    // Filter to recent activities
    const recentAttempts = recentActivity.filter(time => now - time < windowMs);
    recentAttempts.push(now);
    
    // Store updated activity
    sessionStorage.setItem(key, JSON.stringify(recentAttempts.slice(-50)));
    
    // Check for suspicious patterns
    if (recentAttempts.length > 10) {
      await this.logSecurityEvent({
        userId,
        eventType: 'suspicious_activity',
        severity: 'high',
        details: {
          activityType,
          attemptCount: recentAttempts.length,
          timeWindow: '5 minutes'
        }
      });
    }
  }

  // Enhanced authentication monitoring
  async monitorAuthAttempt(email: string, success: boolean, method: string = 'password'): Promise<void> {
    await this.logSecurityEvent({
      eventType: 'auth_attempt',
      severity: success ? 'low' : 'medium',
      details: {
        email: email.substring(0, 3) + '***', // Masked email
        success,
        method,
        timestamp: new Date().toISOString()
      }
    });

    if (!success) {
      await this.detectSuspiciousActivity(email, 'failed_auth');
    }
  }

  // Monitor data access patterns
  async monitorDataAccess(userId: string, resource: string, action: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      eventType: 'data_access',
      severity: 'low',
      details: {
        resource,
        action,
        timestamp: new Date().toISOString()
      }
    });

    // Check for unusual access patterns
    await this.detectSuspiciousActivity(userId, `data_access_${resource}`);
  }

  // Monitor admin actions
  async monitorAdminAction(adminId: string, action: string, targetResource?: string): Promise<void> {
    await this.logSecurityEvent({
      userId: adminId,
      eventType: 'admin_action',
      severity: 'medium',
      details: {
        action,
        targetResource,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();

// Convenience functions
export const logAuthAttempt = (email: string, success: boolean, method?: string) => 
  securityMonitor.monitorAuthAttempt(email, success, method);

export const logDataAccess = (userId: string, resource: string, action: string) =>
  securityMonitor.monitorDataAccess(userId, resource, action);

export const logAdminAction = (adminId: string, action: string, target?: string) =>
  securityMonitor.monitorAdminAction(adminId, action, target);

export const logSuspiciousActivity = (userId: string, details: Record<string, any>) =>
  securityMonitor.logSecurityEvent({
    userId,
    eventType: 'suspicious_activity',
    severity: 'high',
    details
  });