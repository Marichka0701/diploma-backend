import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { EOrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrderSchedulerService {
  private readonly logger = new Logger(OrderSchedulerService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'expire-past-created-orders' })
  async expirePastCreatedOrders(): Promise<void> {
    const now = new Date();

    const result = await this.orderRepository
      .createQueryBuilder()
      .update(OrderEntity)
      .set({ status: EOrderStatus.EXPIRED })
      .where('status = :status', { status: EOrderStatus.CREATED })
      .andWhere('datetime < :now', { now })
      .execute();

    const affected = result.affected ?? 0;
    if (affected > 0) {
      this.logger.log(
        `Expired ${affected} CREATED order(s) whose scheduled date has passed`,
      );
    }
  }
}
