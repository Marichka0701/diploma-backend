import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOfferDto } from './dtos/requests/create-offer';
import { OfferEntity } from './entities/offer.entity';

@Injectable()
export class OfferService {
  constructor(
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
}
