import { ApplicationEntity } from 'src/modules/application/entities/application.entity';
import { OrderEntity } from 'src/modules/order/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('offers')
export class OfferEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ApplicationEntity, (application) => application.offer)
  application: ApplicationEntity;

  @Column({ type: 'uuid' })
  applicationId: string;

  @OneToOne(() => OrderEntity, (order) => order.offer)
  order: OrderEntity;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
