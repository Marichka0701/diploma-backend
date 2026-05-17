import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfferEntity } from './entities/offer.entity';
import { EOfferStatus } from './enums/offer-status.enum';

@Injectable()
export class OfferSchedulerService {
  private readonly logger = new Logger(OfferSchedulerService.name);

  constructor(
    @InjectRepository(OfferEntity)
    private readonly offerRepository: Repository<OfferEntity>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'expire-stale-offers' })
  async expireStaleOffers(): Promise<void> {
    const now = new Date();

    const result = await this.offerRepository
      .createQueryBuilder()
      .update(OfferEntity)
      .set({ status: EOfferStatus.EXPIRED })
      .where('status = :status', { status: EOfferStatus.CREATED })
      .andWhere('"expiresAt" IS NOT NULL')
      .andWhere('"expiresAt" < :now', { now })
      .execute();

    const affected = result.affected ?? 0;
    if (affected > 0) {
      this.logger.log(
        `Expired ${affected} offer(s) that the cleaner did not respond to`,
      );
    }
  }
}
