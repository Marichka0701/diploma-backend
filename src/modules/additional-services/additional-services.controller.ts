import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdditionalServicesService } from './additional-services.service';
import { CreateAdditionalServiceDto } from './dtos/requests/create-additional-service';

@Controller('additional-services')
export class AdditionalServicesController {
  constructor(
    public readonly additionalServicesService: AdditionalServicesService,
  ) {}

  @Get('/')
  public async getAll() {
    return await this.additionalServicesService.getAll();
  }

  @Post('/')
  @UseInterceptors(
    FileInterceptor('icon', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  public async create(
    @UploadedFile() icon: Express.Multer.File,
    @Body() dto: CreateAdditionalServiceDto,
  ) {
    const iconName = icon?.filename;

    return await this.additionalServicesService.create({
      ...dto,
      icon: iconName,
    });
  }

  @Delete('/:id')
  public async deleteByid(@Param('id') id: string) {
    return await this.additionalServicesService.deleteById(id);
  }
}
