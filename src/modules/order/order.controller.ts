import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrderStatus } from 'src/shared/enums/order-status.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateApplicationDto } from './dtos/requests/create-application.dto';
import { CreateOrderDto } from './dtos/requests/create-order.dto';
import { OrderService } from './order.service';

@Controller('order')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/')
  public async getAll(
    @Request() request,
    @Query('status') status?: OrderStatus,
  ) {
    const userId = request.user.id;

    if (status && !Object.values(OrderStatus).includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    return await this.orderService.getAllByCurrentUser(userId, status);
  }

  @Post('/')
  public async create(@Body() dto: CreateOrderDto) {
    return await this.orderService.create(dto);
  }

  @Get('/:id/applications')
  public async getAllApplicationsByOrderId(@Param('id') id: string) {
    return await this.orderService.getAllApplicationsByOrderId(id);
  }

  @Post('/:id/application')
  public async createApplicationForOrderId(
    @Request() request,
    @Param('id') orderId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    const user = request.user;

    return await this.orderService.createApplicationForOrderId(
      orderId,
      user,
      dto,
    );
  }

  @Get('/:id')
  public async getById(@Param('id') id: string) {
    return await this.orderService.getById(id);
  }
}
