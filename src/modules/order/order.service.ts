import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EOrderStatus } from 'src/modules/order/enums/order-status.enum';
import { JWTUser } from 'src/shared/types/jwt.type';
import { In, Repository } from 'typeorm';
import { AdditionalServiceEntity } from '../additional-services/entities/additional-service.entity';
import { ApplicationService } from '../application/application.service';
import { EUserRole } from '../user/enums/role.enum';
import { CreateApplicationDto } from './dtos/requests/create-application.dto';
import { CreateOrderDto } from './dtos/requests/create-order.dto';
import { FinishOrderDto } from './dtos/requests/finish-order.dto';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly applicationService: ApplicationService,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(AdditionalServiceEntity)
    private readonly additionalServiceRepository: Repository<AdditionalServiceEntity>,
  ) {}

  public async getJobRequests(
    cleanerId: string,
    params: { status?: EOrderStatus[] },
  ) {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.applications', 'application')
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

    return await queryBuilder.getMany();
  }

  public async getAllByCurrentUser(
    userId: string,
    params: { status?: EOrderStatus[] },
  ) {
    const orders = await this.orderRepository.find({
      where: {
        user: { id: userId },
        ...(params.status && {
          status: In(params.status),
        }),
      },
      relations: {
        package: true,
        applications: true,
      },
    });

    const additionalServiceIds = [
      ...new Set(orders.flatMap((o) => o.additionalServicesIds ?? [])),
    ];

    const additionalServices = additionalServiceIds.length
      ? await this.additionalServiceRepository.find({
          where: { id: In(additionalServiceIds) },
        })
      : [];

    return orders.map((order) => ({
      ...order,
      additionalServices: additionalServices.filter((s) =>
        order.additionalServicesIds?.includes(s.id),
      ),
    }));
  }

  public async create(userId: string, dto: CreateOrderDto) {
    return await this.orderRepository.save({
      ...dto,
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

    // we can cancel only created orders
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
    params: { price?: number },
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
    const order = await this.getById(orderId);

    if (order.status !== EOrderStatus.IN_PROGRESS) {
      throw new BadRequestException('Order status is not IN_PROGRESS');
    }
    if (user.userId !== order.cleaner.id) {
      throw new BadRequestException('You are not a cleaner of this order');
    }

    return await this.orderRepository.save({
      ...order,
      ...dto,
      status: EOrderStatus.COMPLETED_BY_CLEANER,
    });
  }

  public async getById(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        package: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
