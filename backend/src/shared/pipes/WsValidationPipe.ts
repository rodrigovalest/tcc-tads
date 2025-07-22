import { ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export class WsValidationPipe extends ValidationPipe {
  protected flattenValidationErrors(validationErrors: any[]): string[] {
    return super.flattenValidationErrors(validationErrors);
  }

  createExceptionFactory() {
    return (validationErrors = []) => {
      const messages = this.flattenValidationErrors(validationErrors);
      return new WsException(messages);
    };
  }
}
