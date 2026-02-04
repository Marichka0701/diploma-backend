import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateCleanerDto } from './dtos/requests/createCleaner';
import { CreateUserDto } from './dtos/requests/createUser.dto';
import { LoginDto } from './dtos/requests/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('/register/cleaner')
  async createCleaner(@Body() dto: CreateCleanerDto) {
    await this.authService.createCleaner(dto);
  }

  @Post('/register/user')
  async createUser(@Body() dto: CreateUserDto) {
    await this.authService.createUser(dto);
  }
}
