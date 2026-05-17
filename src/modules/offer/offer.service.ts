import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApplicationEntity } from '../application/entities/application.entity';
import { EOrderStatus } from '../order/enums/order-status.enum';
import { OrderService } from '../order/order.service';
import { CreateOfferDto } from './dtos/requests/create-offer';
import { OfferEntity } from './entities/offer.entity';
import { EOfferStatus } from './enums/offer-status.enum';

const OFFER_TTL_MS = 24 * 60 * 60 * 1000;
const MIN_LEAD_TIME_BEFORE_DATETIME_MS = 2 * 60 * 60 * 1000;

const ACTIVE_OFFER_STATUSES = [
  EOfferStatus.CREATED,
  EOfferStatus.ACCEPTED,
] as const;

@Injectable()
export class OfferService {
  constructor(
    private readonly orderService: OrderService,
    @InjectRepository(OfferEntity)
    private readonly offerRepository: Repository<OfferEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  public async getAllByCurrentCleaner(userId: string) {
    return await this.offerRepository.find({
      where: {
        application: {
          cleaner: {
            id: userId,
          },
        },
        status: EOfferStatus.CREATED,
      },
      relations: [
        'application',
        'application.cleaner',
        'application.order',
        'application.order.user',
        'application.order.package',
        'application.order.additionalServices',
      ],
    });
  }

  public async create(dto: CreateOfferDto, userId: string) {
    const existingForApplication = await this.offerRepository.findOneBy({
      applicationId: dto.applicationId,
    });
    if (existingForApplication) {
      throw new BadRequestException('Offer already exists for this application');
    }

    const application = await this.applicationRepository.findOne({
      where: { id: dto.applicationId },
      relations: ['order', 'order.user'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (application.order.user?.id !== userId) {
      throw new ForbiddenException('You are not the owner of this order');
    }
    if (application.order.status !== EOrderStatus.CREATED) {
      throw new BadRequestException('Order is not accepting offers');
    }

    const activeOnOrder = await this.offerRepository.findOne({
      where: {
        orderId: application.order.id,
        status: In(ACTIVE_OFFER_STATUSES as unknown as EOfferStatus[]),
      },
    });
    if (activeOnOrder) {
      throw new BadRequestException(
        'An active offer already exists for this order; withdraw or wait for it to expire first',
      );
    }

    const expiresAt = this.computeExpiresAt(application.order.datetime);

    const savedOffer = await this.offerRepository.save({
      applicationId: dto.applicationId,
      orderId: application.order.id,
      expiresAt,
    });

    await this.applicationRepository.update(dto.applicationId, {
      offer: { id: savedOffer.id },
    });

    return savedOffer;
  }

  public async acceptOffer(id: string, userId: string) {
    const offer = await this.getById(id);

    if (offer.application?.cleaner?.id !== userId) {
      throw new ForbiddenException('You are not the recipient of this offer');
    }
    if (offer.status !== EOfferStatus.CREATED) {
      throw new BadRequestException('Offer status is not CREATED');
    }
    if (offer.expiresAt && offer.expiresAt.getTime() <= Date.now()) {
      await this.offerRepository.save({
        ...offer,
        status: EOfferStatus.EXPIRED,
      });
      throw new BadRequestException('Offer has already expired');
    }

    await this.orderService.startExecution(offer.application.order.id);
    return await this.offerRepository.save({
      ...offer,
      status: EOfferStatus.ACCEPTED,
    });
  }

  public async declineOffer(id: string, userId: string) {
    const offer = await this.getById(id);

    if (offer.application?.cleaner?.id !== userId) {
      throw new ForbiddenException('You are not the recipient of this offer');
    }
    if (offer.status !== EOfferStatus.CREATED) {
      throw new BadRequestException('Offer status is not CREATED');
    }

    return await this.offerRepository.save({
      ...offer,
      status: EOfferStatus.DECLINE,
    });
  }

  public async withdrawOffer(id: string, userId: string) {
    const offer = await this.getById(id);

    if (offer.application?.order?.user?.id !== userId) {
      throw new ForbiddenException('You are not the owner of this order');
    }
    if (offer.status !== EOfferStatus.CREATED) {
      throw new BadRequestException('Only CREATED offers can be withdrawn');
    }

    return await this.offerRepository.save({
      ...offer,
      status: EOfferStatus.WITHDRAWN,
    });
  }

  public async getById(id: string) {
    const offer = await this.offerRepository.findOne({
      where: {
        id,
      },
      relations: [
        'application',
        'application.cleaner',
        'application.order',
        'application.order.user',
      ],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  private computeExpiresAt(orderDatetime: Date): Date {
    const now = Date.now();
    const defaultExpiry = now + OFFER_TTL_MS;
    const datetimeCap =
      orderDatetime.getTime() - MIN_LEAD_TIME_BEFORE_DATETIME_MS;
    const expiresAtMs = Math.min(defaultExpiry, datetimeCap);

    if (expiresAtMs <= now) {
      throw new BadRequestException(
        'Order scheduled time is too close; cannot send an offer',
      );
    }
    return new Date(expiresAtMs);
  }
}
