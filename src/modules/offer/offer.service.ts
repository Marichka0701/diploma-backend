import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEntity } from '../application/entities/application.entity';
import { OrderService } from '../order/order.service';
import { CreateOfferDto } from './dtos/requests/create-offer';
import { OfferEntity } from './entities/offer.entity';
import { EOfferStatus } from './enums/offer-status.enum';

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

  public async create(dto: CreateOfferDto) {
    const offer = await this.offerRepository.findOneBy({
      applicationId: dto.applicationId,
    });

    if (offer) {
      throw new BadRequestException('Offer already exists');
    }

    const application = await this.applicationRepository.findOne({
      where: { id: dto.applicationId },
      relations: ['order'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const savedOffer = await this.offerRepository.save({
      applicationId: dto.applicationId,
      orderId: application.order.id,
    });

    await this.applicationRepository.update(dto.applicationId, {
      offer: { id: savedOffer.id },
    });

    return savedOffer;
  }

  public async acceptOffer(id: string) {
    const offer = await this.getById(id);

    if (offer.status !== EOfferStatus.CREATED) {
      throw new BadRequestException('Offer status is not CREATED');
    }

    await this.orderService.startExecution(offer.application.order.id);
    return await this.offerRepository.save({
      ...offer,
      status: EOfferStatus.ACCEPTED,
    });
  }

  public async declineOffer(id: string) {
    const offer = await this.getById(id);

    if (offer.status !== EOfferStatus.CREATED) {
      throw new BadRequestException('Offer status is not CREATED');
    }

    return await this.offerRepository.save({
      ...offer,
      status: EOfferStatus.DECLINE,
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
}
