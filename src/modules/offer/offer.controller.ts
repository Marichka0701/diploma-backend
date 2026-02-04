import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/reflectors/roles.reflector';
import { AuthGuard } from '../auth/guards/auth.guard';
import { EUserRole } from '../user/enums/role.enum';
import { CreateOfferDto } from './dtos/requests/createOffer';
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

  @Post('/:id/accept')
  @Roles([EUserRole.CLEANER])
  @UseGuards(RolesGuard)
  public async acceptOffer(@Param('id') id: string) {
    return await this.offerService.acceptOffer(id);
  }

  @Post('/:id/decline')
  @Roles([EUserRole.CLEANER])
  @UseGuards(RolesGuard)
  public async declineOffer(@Param('id') id: string) {
    return await this.offerService.declineOffer(id);
  }

  @Get('/:id')
  @Roles([EUserRole.CLEANER])
  @UseGuards(RolesGuard)
  public async getById(@Param('id') id: string) {
    return await this.offerService.getById(id);
  }
}
