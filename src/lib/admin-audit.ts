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
  ip_address?: string;
  user_agent?: string;
}

class AdminAuditLogger {
  private pendingLogs: AdminAuditLog[] = [];
  
  async logAction(log: AdminAuditLog): Promise<void> {
    try {
      // Enhance log with client info
      const enhancedLog = {
        ...log,
        timestamp: new Date().toISOString(),
        ip_address: this.getClientIP(),
        user_agent: navigator.userAgent?.slice(0, 255),
        session_id: this.getSessionId()
      };

      // Sanitize sensitive data
      if (enhancedLog.old_data) {
        enhancedLog.old_data = this.sanitizeSensitiveData(enhancedLog.old_data);
      }
      if (enhancedLog.new_data) {
        enhancedLog.new_data = this.sanitizeSensitiveData(enhancedLog.new_data);
      }

      // Queue for batch processing
      this.pendingLogs.push(enhancedLog);
      
      // Process immediately for critical actions
      if (this.isCriticalAction(log.action)) {
        await this.flushLogs();
      }
      
      console.log('Admin action logged:', {
        admin_id: log.admin_id,
        action: log.action,
        resource_type: log.resource_type,
        target_user_id: log.target_user_id
      });
      
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }
  
  async logGuestEmailAccess(adminId: string, guestEmail: string, justification: string): Promise<void> {
    await this.logAction({
      admin_id: adminId,
      action: 'GUEST_EMAIL_ACCESS',
      resource_type: 'guest_email',
      resource_id: guestEmail,
      justification,
      new_data: { accessed_email: this.maskEmail(guestEmail) }
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