import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TypingManagerService {
  private readonly logger = new Logger(TypingManagerService.name);
  private readonly typingUsers = new Map<string, Set<number>>();
  private readonly typingTimeouts = new Map<string, NodeJS.Timeout>();

  startTyping(conversationId: string, userId: number): boolean {
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }

    const wasTyping = this.typingUsers.get(conversationId)!.has(userId);
    this.typingUsers.get(conversationId)!.add(userId);

    const timeoutKey = `${userId}:${conversationId}`;
    const existingTimeout = this.typingTimeouts.get(timeoutKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    const timeout = setTimeout(() => {
      this.stopTyping(conversationId, userId);
    }, 10000);
    
    this.typingTimeouts.set(timeoutKey, timeout);

    return !wasTyping;
  }

  stopTyping(conversationId: string, userId: number): boolean {
    const timeoutKey = `${userId}:${conversationId}`;
    const timeout = this.typingTimeouts.get(timeoutKey);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(timeoutKey);
    }

    if (!this.typingUsers.has(conversationId)) {
      return false;
    }

    const wasTyping = this.typingUsers.get(conversationId)!.has(userId);
    this.typingUsers.get(conversationId)!.delete(userId);

    if (this.typingUsers.get(conversationId)!.size === 0) {
      this.typingUsers.delete(conversationId);
    }

    return wasTyping;
  }

  getTypingUsers(conversationId: string): number[] {
    return Array.from(this.typingUsers.get(conversationId) || new Set());
  }

  isUserTyping(conversationId: string, userId: number): boolean {
    return this.typingUsers.get(conversationId)?.has(userId) || false;
  }

  clearUserTyping(userId: number): void {
    for (const [conversationId, users] of this.typingUsers.entries()) {
      if (users.has(userId)) {
        this.stopTyping(conversationId, userId);
      }
    }
  }
}