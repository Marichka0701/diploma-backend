import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EOrderStatus } from 'src/modules/order/enums/order-status.enum';
import { CLEANER_COMMISSION_RATE } from 'src/shared/constants/commission.constants';
import { JWTUser } from 'src/shared/types/jwt.type';
import { In, Repository } from 'typeorm';
import { AdditionalServiceEntity } from '../additional-services/entities/additional-service.entity';
import { ApplicationService } from '../application/application.service';
import { GetApplicationsByOrderDto } from '../application/dtos/requests/get-applications-by-order.dto';
import { ApplicationEntity } from '../application/entities/application.entity';
import { FeedbackEntity } from '../feedback/entities/feedback.entity';
import { OfferEntity } from '../offer/entities/offer.entity';
import { EUserRole } from '../user/enums/role.enum';
import { CreateApplicationDto } from './dtos/requests/create-application.dto';
import { CreateOrderDto } from './dtos/requests/create-order.dto';
import { FinishOrderDto } from './dtos/requests/finish-order.dto';
import { GetHistoryDto } from './dtos/requests/get-history.dto';
import { OrderEntity } from './entities/order.entity';
import { EHistorySort } from './enums/history-sort.enum';

const DEFAULT_HISTORY_STATUSES: EOrderStatus[] = [
  EOrderStatus.IN_PROGRESS,
  EOrderStatus.COMPLETED_BY_CLEANER,
  EOrderStatus.COMPLETED_BY_USER,
  EOrderStatus.DONE,
  EOrderStatus.CANCELLED,
  EOrderStatus.EXPIRED,
];

const NON_PAYING_STATUSES: EOrderStatus[] = [
  EOrderStatus.CANCELLED,
  EOrderStatus.EXPIRED,
];

const EARNED_STATUSES: EOrderStatus[] = [
  EOrderStatus.COMPLETED_BY_CLEANER,
  EOrderStatus.COMPLETED_BY_USER,
  EOrderStatus.DONE,
];

type EarningsBlock = {
  gross: number;
  commission: number;
  net: number;
  commissionRate: number;
};

@Injectable()
export class OrderService {
  constructor(
    private readonly applicationService: ApplicationService,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(AdditionalServiceEntity)
    private readonly additionalServiceRepository: Repository<AdditionalServiceEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(FeedbackEntity)
    private readonly feedbackRepository: Repository<FeedbackEntity>,
  ) {}

  public async getJobRequests(
    cleanerId: string,
    params: {
      status?: EOrderStatus[];
      priceFrom?: number;
      priceTo?: number;
      servicePackage?: string;
      additionalServices?: string[];
    },
  ) {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.applications', 'application')
      .leftJoinAndSelect('order.package', 'package')
      .leftJoinAndSelect('order.additionalServices', 'additionalServices')
      .leftJoin('order.user', 'user')
      .addSelect(['user.id', 'user.firstName', 'user.lastName'])
      .where(
        `NOT EXISTS (
          SELECT 1 FROM applications a
          WHERE a."orderId" = order.id AND a."cleanerId" = :cleanerId
        )`,
        { cleanerId },
      );

    if (params.status) {
      queryBuilder.andWhere('order.status IN (:...statuses)', {
        statuses: params.status,
      });
    }
    if (params.priceFrom) {
      queryBuilder.andWhere('order.price >= :priceFrom', {
        priceFrom: Number(params.priceFrom),
      });
    }
    if (params.priceTo) {
      queryBuilder.andWhere('order.price <= :priceTo', {
        priceTo: Number(params.priceTo),
      });
    }
    if (params.servicePackage) {
      queryBuilder.andWhere('order.packageId = :servicePackage', {
        servicePackage: params.servicePackage,
      });
    }
    if (params.additionalServices) {
      const services = Array.isArray(params.additionalServices)
        ? params.additionalServices
        : [params.additionalServices];
      queryBuilder.andWhere(
        'order.additionalServicesIds @> :additionalServices',
        {
          additionalServices: services,
        },
      );
    }

    return await queryBuilder.getMany();
  }

  public async getAllByCurrentUser(
    userId: string,
    role: EUserRole,
    params: { status?: EOrderStatus[] },
  ) {
    return await this.orderRepository.find({
      where: {
        ...(role === EUserRole.USER && { user: { id: userId } }),
        ...(params.status && {
          status: In(params.status),
        }),
        ...(role === EUserRole.CLEANER && {
          offer: {
            application: {
              cleaner: {
                id: userId,
              },
            },
          },
        }),
      },
      relations: [
        'applications',
        'package',
        'offer',
        'offer.application',
        'offer.application.cleaner',
        'user',
      ],
    });
  }

  public async getHistoryForCleaner(cleanerId: string, dto: GetHistoryDto) {
    const requested = dto.status ?? [];
    const statuses = (
      requested.length > 0
        ? requested.filter((s) => s !== EOrderStatus.CREATED)
        : DEFAULT_HISTORY_STATUSES
    ) as EOrderStatus[];

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const sort = dto.sort ?? EHistorySort.NEWEST;

    if (statuses.length === 0) {
      return {
        items: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const idQb = this.orderRepository
      .createQueryBuilder('order')
      .innerJoin(
        ApplicationEntity,
        'app',
        'app."orderId" = order.id AND app."cleanerId" = :cleanerId',
        { cleanerId },
      )
      .innerJoin(OfferEntity, 'ofr', 'ofr."applicationId" = app.id')
      .leftJoin('order.user', 'customer')
      .where('order.status IN (:...statuses)', { statuses });

    if (sort === EHistorySort.POPULAR) {
      idQb.leftJoin(
        FeedbackEntity,
        'fb',
        'fb."orderId" = order.id AND fb."recipientId" = :recipientId',
        { recipientId: cleanerId },
      );
    }

    if (dto.clientName) {
      idQb.andWhere(
        '(customer."firstName" ILIKE :cn OR customer."lastName" ILIKE :cn)',
        { cn: `%${dto.clientName}%` },
      );
    }
    if (dto.dateFrom) {
      idQb.andWhere('order.datetime >= :dateFrom', { dateFrom: dto.dateFrom });
    }
    if (dto.dateTo) {
      const end = new Date(dto.dateTo);
      end.setUTCHours(23, 59, 59, 999);
      idQb.andWhere('order.datetime <= :dateTo', { dateTo: end });
    }
    if (dto.servicePackageId) {
      idQb.andWhere('order."packageId" = :packageId', {
        packageId: dto.servicePackageId,
      });
    }

    const total = await idQb.getCount();

    idQb
      .select('order.id', 'id')
      .addSelect('order.datetime', 'datetime')
      .offset((page - 1) * limit)
      .limit(limit);

    switch (sort) {
      case EHistorySort.OLDEST:
        idQb.orderBy('order.datetime', 'ASC');
        break;
      case EHistorySort.PRICE_DESC:
        idQb
          .addSelect('app.price', 'price')
          .orderBy('app.price', 'DESC')
          .addOrderBy('order.datetime', 'DESC');
        break;
      case EHistorySort.PRICE_ASC:
        idQb
          .addSelect('app.price', 'price')
          .orderBy('app.price', 'ASC')
          .addOrderBy('order.datetime', 'DESC');
        break;
      case EHistorySort.POPULAR:
        idQb
          .addSelect('fb.rating', 'rating')
          .orderBy('fb.rating', 'DESC', 'NULLS LAST')
          .addOrderBy('order.datetime', 'DESC');
        break;
      case EHistorySort.NEWEST:
      default:
        idQb.orderBy('order.datetime', 'DESC');
        break;
    }

    const idRows = await idQb.getRawMany<{ id: string }>();
    const orderIds = idRows.map((r) => r.id);

    if (orderIds.length === 0) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 0,
        },
      };
    }

    const ordersRaw = await this.orderRepository.find({
      where: { id: In(orderIds) },
      relations: ['user', 'package', 'additionalServices'],
    });
    const orderById = new Map(ordersRaw.map((o) => [o.id, o]));
    const orders = orderIds
      .map((id) => orderById.get(id))
      .filter((o): o is OrderEntity => Boolean(o));
    const [apps, feedbacks] = await Promise.all([
      this.applicationRepository.find({
        where: { order: { id: In(orderIds) }, cleaner: { id: cleanerId } },
        relations: ['order'],
      }),
      this.feedbackRepository.find({
        where: { orderId: In(orderIds), recipientId: cleanerId },
      }),
    ]);

    const appByOrder = new Map(apps.map((a) => [a.order.id, a]));
    const fbByOrder = new Map(feedbacks.map((f) => [f.orderId, f]));

    const items = orders.map((order) => {
      const app = appByOrder.get(order.id);
      const fb = fbByOrder.get(order.id);
      const earnings = this.computeEarnings(
        app ? Number(app.price) : 0,
        order.status,
      );

      return {
        order,
        appliedApplication: app
          ? {
              id: app.id,
              price: Number(app.price),
              coverLetter: app.coverLetter,
              createdAt: app.createdAt,
            }
          : null,
        review: fb
          ? {
              rating: fb.rating,
              comment: fb.comment,
              ratedAt: fb.createdAt,
            }
          : null,
        earnings,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getEarningsForCleaner(cleanerId: string, month: string) {
    const [year, monthNum] = month.split('-').map(Number);
    const start = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, monthNum, 1, 0, 0, 0, 0));

    const rows = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin(
        ApplicationEntity,
        'app',
        'app."orderId" = order.id AND app."cleanerId" = :cleanerId',
        { cleanerId },
      )
      .innerJoin(OfferEntity, 'ofr', 'ofr."applicationId" = app.id')
      .where('order.status IN (:...statuses)', { statuses: EARNED_STATUSES })
      .andWhere(
        '"order"."updatedAt" >= :start AND "order"."updatedAt" < :end',
        { start, end },
      )
      .select('app.price', 'price')
      .getRawMany<{ price: string }>();

    let gross = 0;
    for (const r of rows) {
      gross += Number(r.price);
    }
    const commission = Math.round(gross * CLEANER_COMMISSION_RATE);
    const net = gross - commission;

    return {
      month,
      currency: 'UAH',
      total: net,
      orderCount: rows.length,
    };
  }

  public async create(userId: string, dto: CreateOrderDto) {
    let additionalServices: AdditionalServiceEntity[] = [];

    if (dto.additionalServicesIds?.length) {
      additionalServices = await this.additionalServiceRepository.findBy({
        id: In(dto.additionalServicesIds),
      });
    }

    return await this.orderRepository.save({
      ...dto,
      additionalServices,
      user: { id: userId },
    });
  }

  public async cancel(id: string) {
    const order = await this.getById(id);

    if (
      order.status !== EOrderStatus.CREATED &&
      order.applications.length === 0
    ) {
      throw new NotFoundException(
        'Only orders with CREATED status can be cancelled and without applications',
      );
    }

    return await this.orderRepository.save({
      ...order,
      status: EOrderStatus.CANCELLED,
    });
  }

  public async startExecution(id: string) {
    const order = await this.getById(id);

    if (order.status !== EOrderStatus.CREATED) {
      throw new BadRequestException('Order status is not CREATED');
    }

    return await this.orderRepository.save({
      ...order,
      status: EOrderStatus.IN_PROGRESS,
    });
  }

  public async getAllApplicationsByOrderId(
    id: string,
    params: GetApplicationsByOrderDto,
  ) {
    return await this.applicationService.getAllByOrderId(id, params);
  }

  public async createApplicationForOrderId(
    orderId: string,
    user: JWTUser,
    dto: CreateApplicationDto,
  ) {
    if (user.role !== EUserRole.CLEANER) {
      throw new BadRequestException('You are not a cleaner');
    }

    const order = await this.getById(orderId);
    if (order.status !== EOrderStatus.CREATED) {
      throw new BadRequestException('Order status is not CREATED');
    }

    return await this.applicationService.create(orderId, user, dto);
  }

  public async finishOrder(
    orderId: string,
    user: JWTUser,
    dto: FinishOrderDto,
  ) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['offer', 'offer.application', 'offer.application.cleaner', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== EOrderStatus.IN_PROGRESS) {
      throw new BadRequestException('Order status is not IN_PROGRESS');
    }
    if (user.userId !== order.user?.id) {
      throw new BadRequestException('You are not the owner of this order');
    }

    const assignedCleanerId = order.offer?.application?.cleaner?.id;
    if (!assignedCleanerId) {
      throw new BadRequestException('Order has no assigned cleaner');
    }

    const updatedOrder = await this.orderRepository.save({
      ...order,
      status: EOrderStatus.COMPLETED_BY_USER,
    });

    await this.feedbackRepository.save({
      orderId,
      authorId: user.userId,
      recipientId: assignedCleanerId,
      rating: dto.rating,
      comment: dto.feedback ?? null,
    });

    return updatedOrder;
  }

  public async getById(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['package', 'additionalServices', 'offer'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  public async getByIdForCaller(id: string, caller: JWTUser) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['package', 'additionalServices', 'offer', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (caller.role !== EUserRole.CLEANER) {
      return order;
    }

    const app = await this.applicationRepository.findOne({
      where: { order: { id }, cleaner: { id: caller.userId } },
      relations: ['offer'],
    });
    if (!app || !app.offer) {
      return order;
    }

    const fb = await this.feedbackRepository.findOne({
      where: { orderId: id, recipientId: caller.userId },
    });

    const earnings = this.computeEarnings(Number(app.price), order.status);

    return {
      ...order,
      appliedApplication: {
        id: app.id,
        price: Number(app.price),
        coverLetter: app.coverLetter,
        createdAt: app.createdAt,
      },
      review: fb
        ? { rating: fb.rating, comment: fb.comment, ratedAt: fb.createdAt }
        : null,
      earnings,
    };
  }

  private computeEarnings(price: number, status: EOrderStatus): EarningsBlock {
    if (NON_PAYING_STATUSES.includes(status)) {
      return {
        gross: 0,
        commission: 0,
        net: 0,
        commissionRate: CLEANER_COMMISSION_RATE,
      };
    }
    const gross = price;
    const commission = Math.round(gross * CLEANER_COMMISSION_RATE);
    return {
      gross,
      commission,
      net: gross - commission,
      commissionRate: CLEANER_COMMISSION_RATE,
    };
  }
}
