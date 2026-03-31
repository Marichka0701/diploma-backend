import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/modules/user/user.service';
import { Repository } from 'typeorm';
import { AUTH_CONSTANTS } from '../../shared/constants/auth.constants';
import { CreateUserDto } from '../user/dtos/requests/create-user.dto';
import { UserEntity } from '../user/entities/user.entity';
import { EUserRole } from '../user/enums/role.enum';
import { LoginDto } from './dtos/requests/login.dto';
import { EAuthErrors } from './enums/errors.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async login(dto: LoginDto) {
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
    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      expiresIn: '1d',
    });
    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret: AUTH_CONSTANTS.REFRESH_SECRET,
      expiresIn: '7d',
    });
    const tokenPair = { accessToken, refreshToken };

    return tokenPair;
  }

  public async createCleaner(dto: any) {
    const hashedPassword = await bcrypt.hash(
      dto.password,
      AUTH_CONSTANTS.SALT_ROUNDS,
    );

    const cleanerDto = {
      ...dto,
      password: hashedPassword,
      role: EUserRole.CLEANER,
    };

    const userExists = await this.userRepository.findOneBy({
      email: dto.email,
    });
    if (userExists) {
      throw new BadRequestException(EAuthErrors.USER_ALREADY_EXISTS);
    }

    const createdCleaner = this.userRepository.create(cleanerDto);
    await this.userRepository.save(createdCleaner);

    return createdCleaner;
  }

  public async createUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      dto.password,
      AUTH_CONSTANTS.SALT_ROUNDS,
    );

    const userDto = {
      ...dto,
      password: hashedPassword,
      role: EUserRole.USER,
    };

    const userExists = await this.userRepository.findOneBy({
      email: userDto.email,
    });
    if (userExists) {
      throw new BadRequestException(EAuthErrors.USER_ALREADY_EXISTS);
    }

    const createdUser = this.userRepository.create(userDto);
    await this.userRepository.save(createdUser);

    return createdUser;
  }
}
