import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class CreateCleanerDto extends BaseUserDto {
  @IsString()
  @IsNotEmpty()
  taxCode: string;

  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true' || value === true)
  hasExperience: string | boolean;

  @IsString()
  @IsNotEmpty()
  birthdayDate: Date | string;

  @IsString()
  @IsNotEmpty()
  lastWorkedPlace: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value) || 0)
  punctuality: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value) || 0)
  stressResistant: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value) || 0)
  cleaningSpeed: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value) || 0)
  cleaningQuality: number;

  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true' || value === true)
  isTeamWorker: string | boolean;

  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true' || value === true)
  hasInventory: string | boolean;
}
