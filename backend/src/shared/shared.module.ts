import { Module, Global } from '@nestjs/common';
import { GlobalConnectionManagerService } from './services/global-connection-manager.service';

@Global()
@Module({
  providers: [GlobalConnectionManagerService],
  exports: [GlobalConnectionManagerService],
})
export class SharedModule {}
