import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseUserDto } from './baseUser.dto';

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
  @IsNumber()
  @IsNotEmpty()
  age: number;

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
}
