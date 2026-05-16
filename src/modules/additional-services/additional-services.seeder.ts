import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AdditionalServiceEntity,
  AdditionalServicePricingUnit,
} from './entities/additional-service.entity';

const DEFAULT_SERVICES: Array<
  Pick<
    AdditionalServiceEntity,
    'name' | 'price' | 'icon' | 'pricingUnit'
  >
> = [
  { name: 'Миття духовки', price: 299, icon: 'oven', pricingUnit: AdditionalServicePricingUnit.Fixed },
  { name: 'Миття витяжки', price: 199, icon: 'hood', pricingUnit: AdditionalServicePricingUnit.Fixed },
  { name: 'Миття посуду', price: 159, icon: 'dishes', pricingUnit: AdditionalServicePricingUnit.Fixed },
  { name: 'Миття холодильника', price: 259, icon: 'fridge', pricingUnit: AdditionalServicePricingUnit.Fixed },
  { name: 'Миття мікрохвильовки', price: 159, icon: 'microwave', pricingUnit: AdditionalServicePricingUnit.Fixed },
  { name: 'Прибирання балкона', price: 159, icon: 'balcony', pricingUnit: AdditionalServicePricingUnit.Fixed },
  { name: 'Прасування', price: 199, icon: 'iron', pricingUnit: AdditionalServicePricingUnit.PerHour },
  { name: 'Додаткові години', price: 199, icon: 'clock', pricingUnit: AdditionalServicePricingUnit.PerHour },
  { name: 'Гардеробна', price: 125, icon: 'wardrobe', pricingUnit: AdditionalServicePricingUnit.Fixed },
  { name: 'Прибрати лоток', price: 149, icon: 'litter-box', pricingUnit: AdditionalServicePricingUnit.Fixed },
  { name: 'Прибирання в шафі', price: 199, icon: 'shelf', pricingUnit: AdditionalServicePricingUnit.PerHour },
  { name: 'Потрібна драбина', price: 299, icon: 'ladder', pricingUnit: AdditionalServicePricingUnit.Fixed },
  { name: 'На замовлення потрібен пилосос', price: 120, icon: 'vacuum', pricingUnit: AdditionalServicePricingUnit.Fixed },
  { name: 'Генеральне прибирання кухні', price: 1399, icon: 'kitchen-deep', pricingUnit: AdditionalServicePricingUnit.Fixed },
  { name: 'Прибирання кухонних шаф', price: 299, icon: 'kitchen-cabinets', pricingUnit: AdditionalServicePricingUnit.Fixed },
];

@Injectable()
export class AdditionalServicesSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdditionalServicesSeeder.name);

  constructor(
    @InjectRepository(AdditionalServiceEntity)
    private readonly additionalServiceRepository: Repository<AdditionalServiceEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const existing = await this.additionalServiceRepository.find({
      select: ['name'],
    });
    const existingNames = new Set(existing.map((s) => s.name));

    const toInsert = DEFAULT_SERVICES.filter((s) => !existingNames.has(s.name));
    if (toInsert.length === 0) return;

    await this.additionalServiceRepository.save(
      toInsert.map((s) => this.additionalServiceRepository.create(s)),
    );
    this.logger.log(`Seeded ${toInsert.length} additional service(s)`);
  }
}
