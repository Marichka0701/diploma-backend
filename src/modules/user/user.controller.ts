import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ChangePasswordDto } from './dtos/requests/change-password.dto';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  public async getAll() {
    return await this.userService.getAll();
  }

  @Post('/change-password')
  public async changePassword(
    @Request() request,
    @Body() dto: ChangePasswordDto,
  ) {
    const userId = request.user.userId;

    return await this.userService.changePassword(userId, dto);
  }

  @Get('/current-user')
  public async getCurrentUser(@Request() request) {
    const userId = request.user.userId;

    return await this.userService.getCurrentUser(userId);
  }
}
