import { ApplicationEntity } from 'src/modules/application/entities/application.entity';
import { OfferEntity } from 'src/modules/offer/entities/offer.entity';
import { EOrderStatus } from 'src/modules/order/enums/order-status.enum';
import { ServicePackageEntity } from 'src/modules/service-packages/entities/service-package.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ECleaningType } from '../enums/cleaning-type.enum';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  city: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar' })
  house: string;

  @Column({ type: 'varchar' })
  entrance: string;

  @Column({ type: 'varchar' })
  appartment: string;

  @Column({ type: 'uuid' })
  packageId: string;

  @ManyToOne(() => ServicePackageEntity)
  @JoinColumn({ name: 'packageId' })
  package: ServicePackageEntity;

  @Column({
    type: 'enum',
    enum: ECleaningType,
    nullable: true,
  })
  cleaningType?: ECleaningType;

  @Column({ type: 'int' })
  square: number;

  @Column({ type: 'int', default: 0 })
  panoramaWindowsCount?: number;

  @Column({ type: 'int', default: 0 })
  baseWindowsCount?: number;

  @Column({ type: 'int', default: 0 })
  bathroomsCount?: number;

  @Column({ type: 'int', default: 0 })
  baseRoomsCount?: number;

  @Column({ type: 'uuid', array: true, nullable: true })
  additionalServicesIds?: string[];

  @Column({ type: 'varchar', array: true, nullable: true })
  photos?: string[];

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'timestamptz' })
  datetime: Date;

  @Column({ type: 'varchar' })
  homeAccessInstructions: string;

  @Column({ type: 'varchar', nullable: true })
  homeAccessAdditionalInstructions?: string;

  @Column({ type: 'enum', enum: EOrderStatus, default: EOrderStatus.CREATED })
  status: EOrderStatus;

  @ManyToOne(() => UserEntity, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => UserEntity, (cleaner) => cleaner.id, { nullable: true })
  @JoinColumn({ name: 'cleanerId' })
  cleaner: UserEntity;

  @OneToMany(() => ApplicationEntity, (application) => application.order)
  applications: ApplicationEntity[];

  @OneToOne(() => OfferEntity, (offer) => offer.order, { nullable: true })
  offer: OfferEntity;

  @CreateDateColumn({ name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
