import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ChangePasswordDto } from './dtos/requests/change-password.dto';
import { UpdateUserDto } from './dtos/requests/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  public async getAll() {
    return await this.userService.getAll();
  }

  @Get('/current-user')
  public async getCurrentUser(@Request() request) {
    const userId = request.user.userId;

    return await this.userService.getById(userId);
  }

  @Patch('/current-user')
  @UseInterceptors(
    FileInterceptor('profilePhoto', {
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
  public async updateCurrentUser(
    @Request() request,
    @Body() dto: UpdateUserDto,
    @UploadedFile() profilePhoto?: Express.Multer.File,
  ) {
    const userId = request.user.userId;
    const filename = profilePhoto?.filename;

    return await this.userService.updateById(userId, {
      ...dto,
      profilePhoto: filename,
    });
  }

  @Get('/:id')
  public async getById(@Param('id') id: string) {
    return await this.userService.getById(id);
  }

  @Post('/change-password')
  public async changePassword(
    @Request() request,
    @Body() dto: ChangePasswordDto,
  ) {
    const userId = request.user.userId;

    return await this.userService.changePassword(userId, dto);
  }
}
