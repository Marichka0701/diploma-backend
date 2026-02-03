import { OfferEntity } from 'src/modules/offer/entities/offer.entity';
import { OrderEntity } from 'src/modules/order/entities/order.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApplicationStatus } from '../enums/application-status.enum';

@Entity('applications')
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'varchar' })
  coverLetter: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.CREATED,
  })
  status: ApplicationStatus;

  @ManyToOne(() => OrderEntity, (order) => order.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @OneToOne(() => OfferEntity)
  @JoinColumn({ name: 'offer_id' })
  offer: OfferEntity;

  @ManyToOne(() => UserEntity, (user) => user.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cleaner_id' })
  cleaner: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
