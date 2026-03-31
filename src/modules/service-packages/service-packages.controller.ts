import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateServicePackageDto } from './dtos/requests/create-service-package';
import { ServicePackagesService } from './service-packages.service';

@Controller('service-packages')
export class ServicePackagesController {
  constructor(
    private readonly servicePackagesService: ServicePackagesService,
  ) {}

  @Get('/')
  public async getAll() {
    return await this.servicePackagesService.getAll();
  }

  @Post('/')
  public async create(@Body() dto: CreateServicePackageDto) {
    return await this.servicePackagesService.create(dto);
  }
}
