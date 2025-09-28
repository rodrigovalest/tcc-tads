import { Injectable, Logger } from '@nestjs/common';

export interface MessageSecurityContext {
  senderId: number;
  receiverId: number;
  content: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ChatSecurityService {
  private readonly logger = new Logger(ChatSecurityService.name);
  private readonly rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  constructor() {}

  sanitizeMessageContent(content: string): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    let sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');

    if (sanitized.length > 4000) {
      sanitized = sanitized.substring(0, 4000) + '...';
    }

    return sanitized.trim();
  }

  checkRateLimit(identifier: string, maxRequests: number = 60, windowMs: number = 60000): boolean {
    const now = Date.now();
    const existing = this.rateLimitMap.get(identifier);

    if (!existing || now > existing.resetTime) {
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (existing.count >= maxRequests) {
      return false;
    }
    existing.count++;
    return true;
  }

  validateMessageStructure(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }
    const requiredFields = ['receiverId', 'content'];
    for (const field of requiredFields) {
      if (!data.hasOwnProperty(field)) {
        return false;
      }
    }

    if (typeof data.receiverId !== 'number' || data.receiverId <= 0) {
      return false;
    }

    if (typeof data.content !== 'string' || data.content.trim().length === 0) {
      return false;
    }

    return true;
  }

  detectSuspiciousPatterns(content: string): { isSuspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];
    let isSuspicious = false;
    const suspiciousUrlPatterns = [
      /bit\.ly|tinyurl|t\.co/i,
      /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/,
      /\b(hack|phish|malware|virus)\b/i
    ];

    for (const pattern of suspiciousUrlPatterns) {
      if (pattern.test(content)) {
        reasons.push('Suspicious URL pattern detected');
        isSuspicious = true;
        break;
      }
    }

    const spamPatterns = [
      /(.)\1{10,}/, // Repetição excessiva de caracteres
      /[A-Z]{20,}/, // Muitas maiúsculas seguidas
      /(urgent|winner|congratulations|claim|prize).{0,50}(click|link|visit)/i
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(content)) {
        reasons.push('Spam pattern detected');
        isSuspicious = true;
        break;
      }
    }

    if (content.length > 2000) {
      reasons.push('Message too long');
      isSuspicious = true;
    }

    return { isSuspicious, reasons };
  }

  async processMessageSecurity(context: MessageSecurityContext): Promise<{
    isValid: boolean;
    sanitizedContent: string;
    securityIssues: string[];
  }> {
    const securityIssues: string[] = [];

    if (!this.validateMessageStructure(context)) {
      securityIssues.push('Invalid message structure');
      return { isValid: false, sanitizedContent: '', securityIssues };
    }

    const userIdentifier = `user:${context.senderId}`;
    if (!this.checkRateLimit(userIdentifier)) {
      securityIssues.push('Rate limit exceeded');
      return { isValid: false, sanitizedContent: '', securityIssues };
    }

    if (context.ipAddress) {
      const ipIdentifier = `ip:${context.ipAddress}`;
      if (!this.checkRateLimit(ipIdentifier, 100)) {
        securityIssues.push('IP rate limit exceeded');
        return { isValid: false, sanitizedContent: '', securityIssues };
      }
    }
    
    const sanitizedContent = this.sanitizeMessageContent(context.content);
    
    const suspiciousCheck = this.detectSuspiciousPatterns(sanitizedContent);
    if (suspiciousCheck.isSuspicious) {
      securityIssues.push(...suspiciousCheck.reasons);
      this.logger.warn(`Suspicious message patterns detected from user ${context.senderId}: ${suspiciousCheck.reasons.join(', ')}`);
    }

    return {
      isValid: !securityIssues.some(issue => 
        issue.includes('rate limit') || 
        issue.includes('structure')
      ),
      sanitizedContent,
      securityIssues
    };
  }
}