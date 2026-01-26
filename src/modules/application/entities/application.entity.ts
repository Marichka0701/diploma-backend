import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('applications')
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'varchar' })
  coverLetter: string;

  @Column({ type: 'varchar' })
  badge: string;

  @ManyToOne(() => UserEntity, (user) => user.orders)
  user: UserEntity;

  @ManyToOne(() => UserEntity, (cleaner) => cleaner.id, { nullable: true })
  cleaner: UserEntity;
}
