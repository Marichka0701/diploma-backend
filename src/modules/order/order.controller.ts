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
import { EOrderStatus } from 'src/modules/order/enums/order-status.enum';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/reflectors/roles.reflector';
import { AuthGuard } from '../auth/guards/auth.guard';
import { EUserRole } from '../user/enums/role.enum';
import { CreateApplicationDto } from './dtos/requests/create-application.dto';
import { CreateOrderDto } from './dtos/requests/create-order.dto';
import { FinishOrderDto } from './dtos/requests/finish-order.dto';
import { OrderService } from './order.service';

@Controller('order')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/')
  public async getAll(
    @Request() request,
    @Query('status') status?: EOrderStatus,
  ) {
    const userId = request.user.userId;

    if (status && !Object.values(EOrderStatus).includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    return await this.orderService.getAllByCurrentUser(userId, { status });
  }

  @Post('/')
  public async create(@Request() request, @Body() dto: CreateOrderDto) {
    const userId = request.user.userId;

    return await this.orderService.create(userId, dto);
  }

  @Post('/:id/cancel')
  public async cancel(@Param('id') id: string) {
    return await this.orderService.cancel(id);
  }

  @Get('/:id/applications')
  public async getAllApplicationsByOrderId(
    @Param('id') id: string,
    @Query('price') price?: number,
  ) {
    return await this.orderService.getAllApplicationsByOrderId(id, { price });
  }

  @Post('/:id/application')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.CLEANER])
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

  @Post('/:id/finish')
  public async finishOrder(
    @Request() request,
    @Param('id') orderId: string,
    @Body() dto: FinishOrderDto,
  ) {
    const user = request.user;

    return await this.orderService.finishOrder(orderId, user, dto);
  }

  @Get('/:id')
  public async getById(@Param('id') id: string) {
    return await this.orderService.getById(id);
  }
}
