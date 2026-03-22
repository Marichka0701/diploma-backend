import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class CreateCleanerDto extends BaseUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  taxCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cardNumer: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  hasExperience: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  birhdayDate: Date | string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastWorkedPlace: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  punctuality: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  stressResistant: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  cleaningSpeed: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  cleaningQuality: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isTeamWorker: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  hasInventory: boolean;

  @ApiProperty()
  @IsArray({ each: true })
  @IsString({ each: true })
  @IsNotEmpty()
  passportImages: string[];
}
