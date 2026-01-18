import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'diploma_user',
      password: '12345',
      database: 'dev',
      entities: [],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
