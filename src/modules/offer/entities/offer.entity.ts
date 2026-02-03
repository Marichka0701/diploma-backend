import { ApplicationEntity } from 'src/modules/application/entities/application.entity';
import { OrderEntity } from 'src/modules/order/entities/order.entity';
import {
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

  @OneToOne(() => ApplicationEntity)
  application: ApplicationEntity;

  @OneToOne(() => OrderEntity)
  order: OrderEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
