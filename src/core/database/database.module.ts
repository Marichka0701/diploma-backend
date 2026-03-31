import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdditionalServiceEntity } from 'src/modules/additional-services/entities/additional-service.entity';
import { ApplicationEntity } from 'src/modules/application/entities/application.entity';
import { OfferEntity } from 'src/modules/offer/entities/offer.entity';
import { OrderEntity } from 'src/modules/order/entities/order.entity';
import { ServicePackageEntity } from 'src/modules/service-packages/entities/service-package.entity';
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
      entities: [
        UserEntity,
        OrderEntity,
        ApplicationEntity,
        OfferEntity,
        ServicePackageEntity,
        AdditionalServiceEntity,
      ],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
