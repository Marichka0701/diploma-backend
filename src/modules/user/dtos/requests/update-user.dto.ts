import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, MinLength } from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class UpdateUserDto extends BaseUserDto {
  @IsOptional()
  declare lastName: string;

  @IsOptional()
  declare firstName: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => String(value).toLowerCase().trim())
  declare email: string;

  @IsOptional()
  declare phoneNumber: string;

  @IsOptional()
  @MinLength(8)
  declare password: string;
}
