import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EOrderStatus } from 'src/modules/order/enums/orderStatus.enum';
import { JWTUser } from 'src/shared/types/jwt.type';
import { Repository } from 'typeorm';
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
  ) {}

  public async getAllByCurrentUser(
    userId: string,
    params: { status?: EOrderStatus },
  ) {
    return await this.orderRepository.findBy({
      user: { id: userId },
      status: params.status,
    });
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
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
