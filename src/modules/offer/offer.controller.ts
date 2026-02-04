import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/reflectors/roles.reflector';
import { AuthGuard } from '../auth/guards/auth.guard';
import { EUserRole } from '../user/enums/role.enum';
import { CreateOfferDto } from './dtos/requests/create-offer';
import { OfferService } from './offer.service';

@Controller('offer')
@UseGuards(AuthGuard)
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Get('/')
  @Roles([EUserRole.CLEANER])
  @UseGuards(RolesGuard)
  public async getAllByCurrentCleaner(@Request() request) {
    const userId = request.user.userId;

    return await this.offerService.getAllByCurrentCleaner(userId);
  }

  @Post('/')
  @Roles([EUserRole.USER])
  @UseGuards(RolesGuard)
  public async create(@Body() dto: CreateOfferDto) {
    return await this.offerService.create(dto);
  }
}
