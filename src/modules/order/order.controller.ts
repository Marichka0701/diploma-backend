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
import { ApplicationService } from '../application/application.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateOrderDto } from './dtos/requests/create-order.dto';
import { OrderService } from './order.service';

@Controller('order')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly applicationService: ApplicationService,
  ) {}

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
    return await this.applicationService.getAllByOrderId(id);
  }

  @Get('/:id')
  public async getById(@Param('id') id: string) {
    return await this.orderService.getById(id);
  }
}
