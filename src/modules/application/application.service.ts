import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JWTUser } from 'src/shared/types/jwt.type';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from '../order/dtos/requests/create-application.dto';
import { EUserRole } from '../user/enums/role.enum';
import { ApplicationEntity } from './entities/application.entity';
import { ApplicationStatus } from './enums/application-status.enum';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  public async getAllByCurrentCleaner(user: JWTUser) {
    if (user.role !== EUserRole.CLEANER) {
      throw new BadRequestException('You are not a cleaner');
    }
    const applications = await this.applicationRepository.findBy({
      cleaner: { id: user.userId },
    });

    return applications;
  }

  public async getAllByOrderId(id: string, params: { price?: number }) {
    const applications = await this.applicationRepository.find({
      where: {
        order: { id },
        price: params.price,
      },
      relations: ['cleaner', 'offer', 'order'],
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
      status: ApplicationStatus.CREATED,
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
