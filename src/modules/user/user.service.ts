import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AUTH_CONSTANTS } from 'src/shared/constants/auth.constants';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ChangePasswordDto } from './dtos/requests/change-password.dto';
import { UpdateUserDto } from './dtos/requests/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { EUserErrors } from './enums/errors.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async getAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  public async getByParamsOrThrowError(
    params: FindOptionsWhere<UserEntity>,
  ): Promise<UserEntity> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where(params)
      .getOne();

    if (!user) {
      throw new BadRequestException(EUserErrors.USER_NOT_FOUND);
    }

    return user;
  }

  public async getById(userId: string): Promise<UserEntity> {
    const user = await this.getByParamsOrThrowError({
      id: userId,
    });

    return user;
  }

  public async updateById(
    userId: string,
    dto: UpdateUserDto & { profilePhoto?: string },
  ) {
    const user = await this.getByParamsOrThrowError({
      id: userId,
    });

    const updatedUser = {
      ...user,
      ...dto,
    };
    const test = await this.userRepository.save({
      ...updatedUser,
    });

    return test;
  }

  public async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.getByParamsOrThrowError({
      id: userId,
    });

    const isOldPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException(EUserErrors.INVALID_OLD_PASSWORD);
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      AUTH_CONSTANTS.SALT_ROUNDS,
    );

    await this.userRepository.save({
      ...user,
      password: hashedPassword,
    });

    return { message: 'Password changed successfully' };
  }
}
