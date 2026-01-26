import { UserEntity } from 'src/modules/user/entities/user.entity';
import { OrderStatus } from 'src/shared/enums/order-status.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ECleaningType } from '../enums/cleaningType.enum';

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

  @Column({
    type: 'enum',
    enum: ECleaningType,
    nullable: true,
  })
  cleaningType?: string;

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

  @Column({ type: 'uuid', nullable: true })
  additionalServices?: string[];

  @Column({ type: 'varchar', nullable: true })
  photos?: string[];

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'timestamptz' })
  datetime: Date;

  @Column({ type: 'varchar' })
  homeAccessInstructions: string;

  @Column({ type: 'varchar', nullable: true })
  homeAccessAdditionalInstructions?: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.CREATED })
  status: OrderStatus;

  @ManyToOne(() => UserEntity, (user) => user.orders)
  user: UserEntity;

  @ManyToOne(() => UserEntity, (cleaner) => cleaner.id, { nullable: true })
  cleaner: UserEntity;
}
