import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/reflectors/roles.reflector';
import { AuthGuard } from '../auth/guards/auth.guard';
import { EUserRole } from '../user/enums/role.enum';
import { ApplicationService } from './application.service';

@Controller('application')
@UseGuards(AuthGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get('/')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.CLEANER])
  public async getAll(@Request() request) {
    const userId = request.user.userId;

    return await this.applicationService.getAllByCurrentCleaner(userId);
  }

  @Get('/:id')
  public async getById(@Param('id') id: string) {
    return await this.applicationService.getById(id);
  }
}
