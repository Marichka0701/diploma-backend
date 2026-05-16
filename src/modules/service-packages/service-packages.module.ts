import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicePackageEntity } from './entities/service-package.entity';
import { ServicePackagesController } from './service-packages.controller';
import { ServicePackagesSeeder } from './service-packages.seeder';
import { ServicePackagesService } from './service-packages.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServicePackageEntity])],
  controllers: [ServicePackagesController],
  providers: [ServicePackagesService, ServicePackagesSeeder],
})
export class ServicePackagesModule {}
