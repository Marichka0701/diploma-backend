import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseUserDto } from './baseUser.dto';

export class CreateCleanerDto extends BaseUserDto {
  @IsString()
  @IsNotEmpty()
  taxCode: string;

  @IsString()
  @IsNotEmpty()
  cardNumer: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsBoolean()
  @IsNotEmpty()
  hasExperience: boolean;

  @IsNumber()
  @IsNotEmpty()
  age: number;

  @IsString()
  @IsNotEmpty()
  lastWorkedPlace: string;

  @IsNumber()
  @IsNotEmpty()
  punctuality: number;

  @IsNumber()
  @IsNotEmpty()
  stressResistant: number;

  @IsNumber()
  @IsNotEmpty()
  cleaningSpeed: number;

  @IsNumber()
  @IsNotEmpty()
  cleaningQuality: number;

  @IsBoolean()
  @IsNotEmpty()
  isTeamWorker: boolean;

  @IsBoolean()
  @IsNotEmpty()
  hasInventory: boolean;
}
