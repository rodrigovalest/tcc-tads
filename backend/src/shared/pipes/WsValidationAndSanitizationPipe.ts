import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class WsValidationAndSanitizationPipe implements PipeTransform {
  private readonly maxMessageLength = 10000; // 10KB
  private readonly maxMessagesPerMinute = 60;
  private readonly userMessageCounters = new Map<number, { count: number; resetTime: number }>();

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (!value) {
      throw new BadRequestException('Dados inválidos');
    }

    this.validateBasicStructure(value);
    if (value.senderId) {
      this.enforceRateLimit(value.senderId);
    }
    const sanitizedValue = this.sanitizeInput(value);
    if (metadata.metatype && this.isValidationEnabled(metadata.metatype)) {
      const object = plainToClass(metadata.metatype, sanitizedValue);
      const errors = await validate(object);
      
      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        ).join('; ');
        throw new BadRequestException(`Dados inválidos: ${errorMessages}`);
      }

      return object;
    }

    return sanitizedValue;
  }

  private validateBasicStructure(value: any): void {
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException('Dados devem ser um objeto');
    }
    if (value.content !== undefined) {
      if (typeof value.content !== 'string') {
        throw new BadRequestException('Conteúdo deve ser string');
      }

      if (value.content.length === 0) {
        throw new BadRequestException('Conteúdo não pode estar vazio');
      }

      if (value.content.length > this.maxMessageLength) {
        throw new BadRequestException(`Mensagem muito longa (máximo ${this.maxMessageLength} caracteres)`);
      }
    }

    if (value.receiverId !== undefined) {
      if (!Number.isInteger(value.receiverId) || value.receiverId <= 0) {
        throw new BadRequestException('ID do destinatário inválido');
      }
    }

    if (value.senderId !== undefined) {
      if (!Number.isInteger(value.senderId) || value.senderId <= 0) {
        throw new BadRequestException('ID do remetente inválido');
      }
    }

    if (value.senderId && value.receiverId && value.senderId === value.receiverId) {
      throw new BadRequestException('Não é possível enviar mensagem para si mesmo');
    }
  }

  private enforceRateLimit(userId: number): void {
    const now = Date.now();
    const minute = 60 * 1000;

    const userCounter = this.userMessageCounters.get(userId);

    if (!userCounter || now > userCounter.resetTime) {
      this.userMessageCounters.set(userId, {
        count: 1,
        resetTime: now + minute
      });
    } else {
      userCounter.count++;

      if (userCounter.count > this.maxMessagesPerMinute) {
        throw new BadRequestException(
          `Limite de mensagens excedido. Máximo ${this.maxMessagesPerMinute} mensagens por minuto`
        );
      }
    }

  }

  private sanitizeInput(value: any): any {
    if (typeof value === 'string') {
      let sanitized = value
        .replace(/<[^>]*>/g, '')
        .replace(/[<>\"'&]/g, (match) => {
          const escapeMap: Record<string, string> = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;'
          };
          return escapeMap[match] || match;
        });

      sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      sanitized = sanitized.replace(/\s+/g, ' ').trim();
      sanitized = sanitized.replace(/javascript:|data:|vbscript:|on\w+\s*=/gi, '');

      return sanitized;
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const sanitized: any = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '');
          if (sanitizedKey) {
            sanitized[sanitizedKey] = this.sanitizeInput(value[key]);
          }
        }
      }
      return sanitized;
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeInput(item));
    }

    return value;
  }
  private cleanupOldCounters(): void {
    const now = Date.now();
    for (const [userId, counter] of this.userMessageCounters.entries()) {
      if (now > counter.resetTime) {
        this.userMessageCounters.delete(userId);
      }
    }
  }

  private isValidationEnabled(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find(type => metatype === type);
  }
}

export function ValidateAndSanitize() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const pipe = new WsValidationAndSanitizationPipe();
      for (let i = 0; i < args.length; i++) {
        if (typeof args[i] === 'object' && args[i] !== null) {
          try {
            args[i] = await pipe.transform(args[i], {
              type: 'body',
              metatype: Object,
              data: ''
            });
          } catch (error) {
            throw error;
          }
        }
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}