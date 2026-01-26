import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { ApplicationModule } from './modules/application/application.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrderModule } from './modules/order/order.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    OrderModule,
    ApplicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
