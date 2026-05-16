import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicePackageEntity } from './entities/service-package.entity';

const COMMON_SERVICES = [
  'Миємо та дизенфікуємо ванну кімнуту та туалет',
  'Миємо підлогу',
  'Миємо вікна з внутрішньої сторони',
  'Миємо витяжку на кухні',
];

const DEFAULT_PACKAGES: Array<
  Pick<
    ServicePackageEntity,
    'name' | 'price' | 'minArea' | 'maxArea' | 'services'
  >
> = [
  {
    name: 'All Inclueted 1-кімнатна',
    price: 999,
    minArea: 20,
    maxArea: 35,
    services: COMMON_SERVICES,
  },
  {
    name: 'All Inclueted 2-кімнатна',
    price: 1400,
    minArea: 36,
    maxArea: 55,
    services: COMMON_SERVICES,
  },
  {
    name: 'All Inclueted 3-кімнатна',
    price: 1800,
    minArea: 56,
    maxArea: 75,
    services: COMMON_SERVICES,
  },
  {
    name: 'Офіси, Будинки',
    price: 2200,
    minArea: 76,
    maxArea: null,
    services: COMMON_SERVICES,
  },
];

@Injectable()
export class ServicePackagesSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(ServicePackagesSeeder.name);

  constructor(
    @InjectRepository(ServicePackageEntity)
    private readonly servicePackageRepository: Repository<ServicePackageEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const existing = await this.servicePackageRepository.find({
      select: ['name'],
    });
    const existingNames = new Set(existing.map((p) => p.name));

    const toInsert = DEFAULT_PACKAGES.filter((p) => !existingNames.has(p.name));
    if (toInsert.length === 0) return;

    await this.servicePackageRepository.save(
      toInsert.map((p) => this.servicePackageRepository.create(p)),
    );
    this.logger.log(`Seeded ${toInsert.length} service package(s)`);
  }
}
