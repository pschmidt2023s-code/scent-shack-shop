/**
 * Enhanced audit logging for admin actions
 */

import { supabase } from '@/integrations/supabase/client';

export interface AdminAuditLog {
  admin_id: string;
  action: string;
  resource_type: 'profile' | 'address' | 'order' | 'payback' | 'user_role' | 'guest_email';
  resource_id?: string;
  target_user_id?: string;
  old_data?: any;
  new_data?: any;
  justification?: string;
  admin_justification?: string;
  ip_address?: string;
  user_agent?: string;
  data?: any;
}

class AdminAuditLogger {
  private pendingLogs: AdminAuditLog[] = [];
  
  async logAction(log: AdminAuditLog): Promise<void> {
    try {
      // Enhanced log with client details and security features
      const enhancedLog = {
        ...log,
        timestamp: new Date().toISOString(),
        ip_address: this.getClientIP(),
        user_agent: navigator.userAgent?.slice(0, 255),
        session_id: this.getSessionId(),
        consent_required: this.isConsentRequired(log.action),
        security_level: this.getSecurityLevel(log.action)
      };

      // For actions requiring consent, ensure justification is provided
      if (enhancedLog.consent_required && !log.admin_justification) {
        throw new Error('Admin justification required for this action');
      }

      // Sanitize sensitive data
      if (enhancedLog.old_data) {
        enhancedLog.old_data = this.sanitizeSensitiveData(enhancedLog.old_data);
      }
      if (enhancedLog.new_data) {
        enhancedLog.new_data = this.sanitizeSensitiveData(enhancedLog.new_data);
      }
      if (enhancedLog.data) {
        enhancedLog.data = this.sanitizeSensitiveData(enhancedLog.data);
      }

      // Queue for batch processing
      this.pendingLogs.push(enhancedLog);
      
      // Process immediately for critical actions
      if (this.isCriticalAction(log.action)) {
        await this.flushLogs();
      }

      // Trigger security alert for high-risk actions
      if (enhancedLog.security_level === 'high') {
        this.triggerSecurityAlert(enhancedLog);
      }
      
      console.log('Admin action logged:', {
        admin_id: log.admin_id,
        action: log.action,
        resource_type: log.resource_type,
        target_user_id: log.target_user_id,
        security_level: enhancedLog.security_level
      });
      
    } catch (error) {
      console.error('Failed to log admin action:', error);
      // Fallback: store critical info in localStorage
      this.fallbackLog(log);
    }
  }
  
  async logGuestEmailAccess(
    adminId: string, 
    guestEmail: string, 
    justification: string
  ): Promise<void> {
    if (!justification) {
      throw new Error('Justification required for guest email access');
    }

    await this.logAction({
      admin_id: adminId,
      action: 'GUEST_EMAIL_ACCESS',
      resource_type: 'guest_email',
      resource_id: guestEmail,
      admin_justification: justification,
      data: { 
        accessed_email: this.maskEmail(guestEmail),
        consent_timestamp: new Date().toISOString()
      }
    });
  }
  
  async logProfileModification(adminId: string, profileId: string, oldData: any, newData: any, justification?: string): Promise<void> {
    await this.logAction({
      admin_id: adminId,
      action: 'PROFILE_MODIFY',
      resource_type: 'profile',
      resource_id: profileId,
      target_user_id: profileId,
      old_data: oldData,
      new_data: newData,
      justification
    });
  }
  
  async logAddressModification(adminId: string, addressId: string, ownerId: string, oldData: any, newData: any): Promise<void> {
    await this.logAction({
      admin_id: adminId,
      action: 'ADDRESS_MODIFY',
      resource_type: 'address',
      resource_id: addressId,
      target_user_id: ownerId,
      old_data: oldData,
      new_data: newData
    });
  }
  
  async logRoleChange(adminId: string, targetUserId: string, oldRole: string, newRole: string, justification?: string): Promise<void> {
    await this.logAction({
      admin_id: adminId,
      action: 'ROLE_CHANGE',
      resource_type: 'user_role',
      target_user_id: targetUserId,
      old_data: { role: oldRole },
      new_data: { role: newRole },
      justification
    });
  }
  
  private async flushLogs(): Promise<void> {
    if (this.pendingLogs.length === 0) return;
    
    try {
      // Store in localStorage as fallback (edge functions would use Supabase)
      const existingLogs = JSON.parse(localStorage.getItem('admin_audit_logs') || '[]');
      existingLogs.push(...this.pendingLogs);
      localStorage.setItem('admin_audit_logs', JSON.stringify(existingLogs.slice(-1000))); // Keep last 1000 logs
      
      this.pendingLogs = [];
    } catch (error) {
      console.error('Failed to persist audit logs:', error);
    }
  }
  
  private isCriticalAction(action: string): boolean {
    const criticalActions = [
      'GUEST_EMAIL_ACCESS', 
      'ROLE_CHANGE', 
      'PROFILE_DELETE', 
      'ADDRESS_DELETE'
    ];
    return criticalActions.includes(action);
  }
  
  private sanitizeSensitiveData(data: any): any {
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      // Mask sensitive fields
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'credit_card'];
      for (const field of sensitiveFields) {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      }
      
      // Mask email addresses
      if ('email' in sanitized) {
        sanitized.email = this.maskEmail(sanitized.email);
      }
      
      return sanitized;
    }
    return data;
  }
  
  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '[INVALID_EMAIL]';
    
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2 
      ? local[0] + '*'.repeat(local.length - 2) + local.slice(-1)
      : '*'.repeat(local.length);
    
    return `${maskedLocal}@${domain}`;
  }
  
  private getClientIP(): string {
    // This would be implemented differently in edge functions
    return 'client-side';
  }
  
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('admin_session_id');
    if (!sessionId) {
      sessionId = 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('admin_session_id', sessionId);
    }
    return sessionId;
  }

  private isConsentRequired(action: string): boolean {
    const consentRequiredActions = [
      'GUEST_EMAIL_ACCESS',
      'PROFILE_MODIFY',
      'ADDRESS_MODIFY',
      'ROLE_CHANGE'
    ];
    return consentRequiredActions.includes(action);
  }

  private getSecurityLevel(action: string): 'low' | 'medium' | 'high' {
    const highRiskActions = ['ROLE_CHANGE', 'GUEST_EMAIL_ACCESS'];
    const mediumRiskActions = ['PROFILE_MODIFY', 'ADDRESS_MODIFY'];
    
    if (highRiskActions.includes(action)) return 'high';
    if (mediumRiskActions.includes(action)) return 'medium';
    return 'low';
  }

  private triggerSecurityAlert(log: any): void {
    // Log security alert for monitoring
    console.warn('High-risk admin action detected:', {
      action: log.action,
      admin_id: log.admin_id,
      timestamp: log.timestamp,
      session_id: log.session_id
    });
    
    // Could integrate with external monitoring service here
  }

  private fallbackLog(log: AdminAuditLog): void {
    try {
      const fallbackLogs = JSON.parse(localStorage.getItem('fallback_admin_logs') || '[]');
      fallbackLogs.push({
        ...log,
        timestamp: new Date().toISOString(),
        fallback: true
      });
      localStorage.setItem('fallback_admin_logs', JSON.stringify(fallbackLogs.slice(-100)));
    } catch (error) {
      console.error('Failed to create fallback log:', error);
    }
  }
  
  // Periodic log flushing
  constructor() {
    // Flush logs every 30 seconds
    setInterval(() => {
      this.flushLogs();
    }, 30 * 1000);
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushLogs();
    });
  }
}

export const adminAuditLogger = new AdminAuditLogger();

// Convenience functions
export const logGuestEmailAccess = (adminId: string, guestEmail: string, justification: string) => 
  adminAuditLogger.logGuestEmailAccess(adminId, guestEmail, justification);

export const logProfileModification = (adminId: string, profileId: string, oldData: any, newData: any, justification?: string) => 
  adminAuditLogger.logProfileModification(adminId, profileId, oldData, newData, justification);

export const logAddressModification = (adminId: string, addressId: string, ownerId: string, oldData: any, newData: any) => 
  adminAuditLogger.logAddressModification(adminId, addressId, ownerId, oldData, newData);

export const logRoleChange = (adminId: string, targetUserId: string, oldRole: string, newRole: string, justification?: string) => 
  adminAuditLogger.logRoleChange(adminId, targetUserId, oldRole, newRole, justification);