import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOfferDto } from './dtos/requests/createOffer';
import { OfferEntity } from './entities/offer.entity';
import { EOfferStatus } from './enums/offerStatus.enum';
import { OrderService } from '../order/order.service';

@Injectable()
export class OfferService {
  constructor(
    private readonly orderService: OrderService,
    @InjectRepository(OfferEntity)
    private readonly offerRepository: Repository<OfferEntity>,
  ) {}

  public async getAllByCurrentCleaner(userId: string) {
    return await this.offerRepository.find({
      where: {
        application: {
          cleaner: {
            id: userId,
          },
        },
      },
      relations: ['application', 'application.cleaner'],
    });
  }

  public async create(dto: CreateOfferDto) {
    const offer = await this.offerRepository.findOneBy({
      applicationId: dto.applicationId,
    });

    if (offer) {
      throw new BadRequestException('Offer already exists');
    }

    return await this.offerRepository.save({
      applicationId: dto.applicationId,
      application: { id: dto.applicationId },
    });
  }

  public async acceptOffer(id: string) {
    const offer = await this.getById(id);

    if (offer.status !== EOfferStatus.CREATED) {
      throw new BadRequestException('Offer status is not CREATED');
    }

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

    await this.orderService.startExecution(offer.application.order.id);
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
      relations: ['application', 'application.cleaner'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }
}
