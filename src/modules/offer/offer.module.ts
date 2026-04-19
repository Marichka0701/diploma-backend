import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdditionalServiceEntity } from '../additional-services/entities/additional-service.entity';
import { ApplicationService } from '../application/application.service';
import { ApplicationEntity } from '../application/entities/application.entity';
import { FeedbackEntity } from '../feedback/entities/feedback.entity';
import { OrderEntity } from '../order/entities/order.entity';
import { OrderService } from '../order/order.service';
import { OfferEntity } from './entities/offer.entity';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfferEntity,
      OrderEntity,
      ApplicationEntity,
      AdditionalServiceEntity,
      FeedbackEntity,
    ]),
  ],
  providers: [OfferService, OrderService, ApplicationService],
  controllers: [OfferController],
})
export class OfferModule {}
