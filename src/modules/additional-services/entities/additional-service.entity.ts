import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AdditionalServicePricingUnit {
  Fixed = 'fixed',
  PerHour = 'per_hour',
}

@Entity('additional_services')
export class AdditionalServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'varchar' })
  icon: string;

  @Column({
    type: 'enum',
    enum: AdditionalServicePricingUnit,
    default: AdditionalServicePricingUnit.Fixed,
  })
  pricingUnit: AdditionalServicePricingUnit;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
