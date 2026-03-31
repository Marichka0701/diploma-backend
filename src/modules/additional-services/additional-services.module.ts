import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdditionalServicesController } from './additional-services.controller';
import { AdditionalServicesService } from './additional-services.service';
import { AdditionalServiceEntity } from './entities/additional-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdditionalServiceEntity])],
  controllers: [AdditionalServicesController],
  providers: [AdditionalServicesService],
})
export class AdditionalServicesModule {}
