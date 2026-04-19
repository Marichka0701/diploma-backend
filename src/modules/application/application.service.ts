import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JWTUser } from 'src/shared/types/jwt.type';
import { Repository } from 'typeorm';
import { FeedbackEntity } from '../feedback/entities/feedback.entity';
import { CreateApplicationDto } from '../order/dtos/requests/create-application.dto';
import { GetApplicationsByOrderDto } from './dtos/requests/get-applications-by-order.dto';
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

  public async getAllByOrderId(id: string, params: GetApplicationsByOrderDto) {
    const qb = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.cleaner', 'cleaner')
      .leftJoinAndSelect('application.offer', 'offer')
      .leftJoin(
        (sub) =>
          sub
            .select('f."recipientId"', 'recipientId')
            .addSelect('AVG(f.rating)', 'avgRating')
            .from(FeedbackEntity, 'f')
            .groupBy('f."recipientId"'),
        'cleaner_avg',
        'cleaner_avg."recipientId" = application."cleanerId"',
      )
      .addSelect('cleaner_avg."avgRating"', 'application_avgRating')
      .where('application."orderId" = :orderId', { orderId: id });

    if (params.priceFrom !== undefined) {
      qb.andWhere('application.price >= :priceFrom', {
        priceFrom: params.priceFrom,
      });
    }
    if (params.priceTo !== undefined) {
      qb.andWhere('application.price <= :priceTo', {
        priceTo: params.priceTo,
      });
    }
    if (params.rating && params.rating.length > 0) {
      qb.andWhere('ROUND(cleaner_avg."avgRating") IN (:...ratings)', {
        ratings: params.rating,
      });
    }

    const { entities, raw } = (await qb.getRawAndEntities()) as {
      entities: ApplicationEntity[];
      raw: Array<{ application_avgRating: string | null }>;
    };

    return entities.map((application, i) => {
      const avgRaw = raw[i]?.application_avgRating;
      const avg =
        avgRaw !== null && avgRaw !== undefined
          ? Number(Number(avgRaw).toFixed(2))
          : null;
      return {
        ...application,
        isApplied: !!application?.offer,
        cleanerAverageRating: avg,
      };
    });
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
      order: { id: orderId },
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
