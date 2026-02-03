import { ApplicationEntity } from 'src/modules/application/entities/application.entity';
import { OfferEntity } from 'src/modules/offer/entities/offer.entity';
import { OrderEntity } from 'src/modules/order/entities/order.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'diploma_user',
  password: '12345',
  database: 'dev',
  entities: [UserEntity, OrderEntity, ApplicationEntity, OfferEntity],
  synchronize: true,
});
