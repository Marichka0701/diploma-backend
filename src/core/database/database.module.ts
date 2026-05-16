import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdditionalServiceEntity } from 'src/modules/additional-services/entities/additional-service.entity';
import { ApplicationEntity } from 'src/modules/application/entities/application.entity';
import { FeedbackEntity } from 'src/modules/feedback/entities/feedback.entity';
import { OfferEntity } from 'src/modules/offer/entities/offer.entity';
import { OrderEntity } from 'src/modules/order/entities/order.entity';
import { ServicePackageEntity } from 'src/modules/service-packages/entities/service-package.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'diploma_user',
      password: process.env.DB_PASSWORD ?? '12345',
      database: process.env.DB_NAME ?? 'dev',
      entities: [
        UserEntity,
        OrderEntity,
        ApplicationEntity,
        OfferEntity,
        ServicePackageEntity,
        AdditionalServiceEntity,
        FeedbackEntity,
      ],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
