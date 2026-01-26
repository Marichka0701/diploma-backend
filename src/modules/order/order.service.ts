import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/shared/enums/order-status.enum';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dtos/requests/create-order.dto';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
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
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  public async getById(id: string) {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
