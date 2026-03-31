import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateCleanerDto } from '../user/dtos/requests/create-cleaner.dto';
import { CreateUserDto } from '../user/dtos/requests/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/requests/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  public async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('/register/cleaner')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'passportImages', maxCount: 2 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  public async createCleaner(
    @UploadedFiles()
    files: {
      profilePhoto?: Express.Multer.File[];
      passportImages?: Express.Multer.File[];
    },
    @Body() dto: CreateCleanerDto,
  ) {
    const profilePhoto = files.profilePhoto?.[0]?.filename;
    const passportImages = files.passportImages?.map((f) => f.filename) ?? [];

    await this.authService.createCleaner({
      ...dto,
      profilePhoto,
      passportImages,
    });
    return await this.authService.login({
      email: dto.email,
      password: dto.password,
    });
  }

  @Post('/register/user')
  public async createUser(@Body() dto: CreateUserDto) {
    await this.authService.createUser(dto);
    return await this.authService.login({
      email: dto.email,
      password: dto.password,
    });
  }
}
