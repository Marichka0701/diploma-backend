import { Module } from '@nestjs/common';
import { DatabaseModule } from './core/database/database.module';
import { ApplicationModule } from './modules/application/application.module';
import { AuthModule } from './modules/auth/auth.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { OfferModule } from './modules/offer/offer.module';
import { OrderModule } from './modules/order/order.module';
import { ServicePackagesModule } from './modules/service-packages/service-packages.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    OrderModule,
    ApplicationModule,
    OfferModule,
    FeedbackModule,
    ServicePackagesModule,
  ],
})
export class AppModule {}
