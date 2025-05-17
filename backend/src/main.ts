import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { QueryFailedErrorFilter } from './shared/filters/query-failed-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new QueryFailedErrorFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
