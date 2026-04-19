import { ApplicationEntity } from 'src/modules/application/entities/application.entity';
import { OrderEntity } from 'src/modules/order/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EOfferStatus } from '../enums/offer-status.enum';

@Entity('offers')
export class OfferEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ApplicationEntity, (application) => application.offer)
  @JoinColumn({ name: 'applicationId' })
  application: ApplicationEntity;

  @Column({ type: 'uuid' })
  applicationId: string;

  @OneToOne(() => OrderEntity, (order) => order.offer)
  @JoinColumn({ name: 'orderId' })
  order: OrderEntity;

  @Column({ type: 'uuid', nullable: true })
  orderId: string;

  @Column({ type: 'enum', enum: EOfferStatus, default: EOfferStatus.CREATED })
  status: EOfferStatus;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
