import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JWTUser } from 'src/shared/types/jwt.type';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from '../order/dtos/requests/create-application.dto';
import { ApplicationEntity } from './entities/application.entity';
import { ApplicationStatus } from './enums/application-status.enum';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  public async getAllByOrderId(id: string) {
    const applications = await this.applicationRepository.findBy({
      orderId: id,
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

    return await this.applicationRepository.save(application);
  }
}
