import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationEntity } from 'src/modules/application/entities/application.entity';
import { OrderEntity } from 'src/modules/order/entities/order.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'diploma_user',
      password: '12345',
      database: 'dev',
      entities: [UserEntity, OrderEntity, ApplicationEntity],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
