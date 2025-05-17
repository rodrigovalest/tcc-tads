import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 14000,
      username: process.env.DATABASE_USERNAME ?? '123mudar',
      password: process.env.DATABASE_PASSWORD ?? '123mudar',
      database: process.env.DATABASE_DATABASE ?? '123mudar',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
