import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/shared/enums/order-status.enum';
import { JWTUser } from 'src/shared/types/jwt.type';
import { Repository } from 'typeorm';
import { ApplicationService } from '../application/application.service';
import { CreateApplicationDto } from './dtos/requests/create-application.dto';
import { CreateOrderDto } from './dtos/requests/create-order.dto';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly applicationService: ApplicationService,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  public async getAllByCurrentUser(userId: string, status?: OrderStatus) {
    return await this.orderRepository.findBy({
      user: { id: userId },
      status,
    });
  }

  public async create(dto: CreateOrderDto) {
    return await this.orderRepository.save(dto);
  }

  public async getAllApplicationsByOrderId(id: string) {
    return await this.applicationService.getAllByOrderId(id);
  }

  public async createApplicationForOrderId(
    orderId: string,
    user: JWTUser,
    dto: CreateApplicationDto,
  ) {
    return await this.applicationService.create(orderId, user, dto);
  }

  public async getById(id: string) {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
