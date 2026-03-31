import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServicePackageDto } from './dtos/requests/create-service-package';
import { ServicePackageEntity } from './entities/service-package.entity';

export class ServicePackagesService {
  constructor(
    @InjectRepository(ServicePackageEntity)
    private readonly servicePackageRepository: Repository<ServicePackageEntity>,
  ) {}

  public async getAll() {
    return await this.servicePackageRepository.find();
  }

  public async create(dto: CreateServicePackageDto) {
    const createdServicePackage = this.servicePackageRepository.create(dto);
    await this.servicePackageRepository.save(createdServicePackage);

    return createdServicePackage;
  }
}
