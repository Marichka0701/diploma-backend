import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdditionalServiceDto } from './dtos/requests/create-additional-service';
import { AdditionalServiceEntity } from './entities/additional-service.entity';

export class AdditionalServicesService {
  constructor(
    @InjectRepository(AdditionalServiceEntity)
    public readonly additionalServiceRepository: Repository<AdditionalServiceEntity>,
  ) {}

  public async getAll() {
    return await this.additionalServiceRepository.find();
  }

  public async create(
    createAdditionalServiceDto: CreateAdditionalServiceDto & { icon: string },
  ) {
    if (!createAdditionalServiceDto.icon) {
      throw new BadRequestException('Icon is required');
    }

    const service = this.additionalServiceRepository.create(
      createAdditionalServiceDto,
    );
    return await this.additionalServiceRepository.save(service);
  }

  public async deleteById(id: string) {
    const service = await this.additionalServiceRepository.findOneBy({
      id,
    });

    if (!service) {
      throw new BadRequestException('Additional service not found');
    }

    await this.additionalServiceRepository.delete(id);

    return { message: 'Additional service deleted successfully' };
  }
}
