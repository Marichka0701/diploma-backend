import { Module } from '@nestjs/common';
import { DatabaseModule } from './core/database/database.module';
import { ApplicationModule } from './modules/application/application.module';
import { AuthModule } from './modules/auth/auth.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { OfferModule } from './modules/offer/offer.module';
import { OrderModule } from './modules/order/order.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    DatabaseModule,
    FileUploadModule,
    AuthModule,
    UserModule,
    OrderModule,
    ApplicationModule,
    OfferModule,
    FeedbackModule,
  ],
})
export class AppModule {}
