import { Controller, Get, Request } from '@nestjs/common';
import { JWTUser } from 'src/shared/types/jwt.type';
import { ApplicationService } from './application.service';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get('/')
  public async getAll(@Request() request) {
    const userId = request.user.userId;

    return await this.applicationService.getAllByCurrentCleaner(userId);
  }
}
