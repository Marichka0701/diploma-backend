import { OrderEntity } from 'src/modules/order/entities/order.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EUserRole } from '../enums/role.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', unique: true })
  phoneNumber: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  taxCode: string | null;

  @Column({ type: 'enum', default: 'user', enum: EUserRole })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  cardNumer: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'boolean', default: false })
  hasExperience: boolean;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ type: 'varchar', nullable: true })
  lastWorkedPlace: string | null;

  @Column({ type: 'int', nullable: true })
  punctuality: number | null;

  @Column({ type: 'int', nullable: true })
  stressResistant: number | null;

  @Column({ type: 'int', nullable: true })
  cleaningSpeed: number | null;

  @Column({ type: 'int', nullable: true })
  cleaningQuality: number | null;

  @Column({ type: 'boolean', default: false })
  isTeamWorker: boolean;

  @Column({ type: 'boolean', default: false })
  hasInventory: boolean;

  @OneToMany(() => OrderEntity, (order) => order.user, { cascade: true })
  orders: OrderEntity[];
}
