import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdditionalServiceEntity } from '../additional-services/entities/additional-service.entity';
import { ApplicationService } from '../application/application.service';
import { ApplicationEntity } from '../application/entities/application.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      ApplicationEntity,
      AdditionalServiceEntity,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, ApplicationService],
})
export class OrderModule {}
