import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JWTUser } from 'src/shared/types/jwt.type';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from '../order/dtos/requests/create-application.dto';
import { ApplicationEntity } from './entities/application.entity';
import { EApplicationStatus } from './enums/application-status.enum';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  public async getAllByCurrentCleaner(userId: string) {
    const applications = await this.applicationRepository.find({
      where: {
        cleaner: { id: userId },
      },
      relations: ['order'],
    });

    return applications;
  }

  public async getById(applicationId: string) {
    const application = await this.applicationRepository.findOne({
      where: {
        id: applicationId,
      },
      relations: ['order'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  public async getAllByOrderId(id: string, params: { price?: number }) {
    const applications = await this.applicationRepository.find({
      where: {
        order: { id },
        price: params.price,
      },
      relations: ['cleaner'],
    });

    return applications;
  }

  public async create(
    orderId: string,
    user: JWTUser,
    dto: CreateApplicationDto,
  ) {
    const application = {
      ...dto,
      order: { id: orderId },
      cleaner: { id: user.userId },
      status: EApplicationStatus.CREATED,
    };

    const applicationExists = await this.applicationRepository.findOneBy({
      cleaner: { id: user.userId },
    });
    if (applicationExists) {
      throw new BadRequestException(
        'Application from this cleaner already exists',
      );
    }

    return await this.applicationRepository.save(application);
  }
}
