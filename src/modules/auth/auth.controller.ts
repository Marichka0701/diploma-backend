import { Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('/login')
  async login() {
    return { message: 'Login successful' };
  }

  @Post('/register/cleaner')
  async createCleaner() {
    return { message: 'Cleaner created' };
  }

  @Post('/register/user')
  async createUser() {
    return { message: 'User created' };
  }
}
