import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/modules/user/user.service';
import { AUTH_CONSTANTS } from '../../shared/constants/auth.constants';
import { EUserRole } from '../user/enums/role.enum';
import { CreateCleanerDto } from './dtos/requests/createCleaner';
import { CreateUserDto } from './dtos/requests/createUser.dto';
import { LoginDto } from './dtos/requests/login.dto';
import { EAuthErrors } from './enums/errors.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userService.getByParamsOrThrowError({
      email: dto.email,
    });

    const arePasswordsEqual = await bcrypt.compare(dto.password, user.password);
    if (!arePasswordsEqual) {
      throw new BadRequestException(EAuthErrors.WRONG_CREDENTIALS);
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret: AUTH_CONSTANTS.REFRESH_SECRET,
      expiresIn: '7d',
    });
    const tokenPair = { accessToken, refreshToken };

    return tokenPair;
  }

  async createCleaner(dto: CreateCleanerDto) {
    const hashedPassword = await bcrypt.hash(
      dto.password,
      AUTH_CONSTANTS.SALT_ROUNDS,
    );

    const cleanerDto = {
      ...dto,
      password: hashedPassword,
      role: EUserRole.CLEANER,
    };

    return await this.userService.createCleaner(cleanerDto);
  }

  async createUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      dto.password,
      AUTH_CONSTANTS.SALT_ROUNDS,
    );

    const userDto = {
      ...dto,
      password: hashedPassword,
      role: EUserRole.USER,
    };

    return await this.userService.createUser(userDto);
  }
}
