import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ECleaningType } from '../../enums/cleaningType.enum';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  house: string;

  @IsString()
  @IsNotEmpty()
  entrance: string;

  @IsString()
  @IsNotEmpty()
  appartment: string;

  @IsString()
  @IsNotEmpty()
  packageId: string;

  @IsEnum(ECleaningType)
  @IsOptional()
  cleaningType?: ECleaningType;

  @IsNumber()
  @IsNotEmpty()
  square: number;

  @IsNumber()
  @IsOptional()
  panoramaWindowsCount?: number;

  @IsNumber()
  @IsOptional()
  baseWindowsCount?: number;

  @IsNumber()
  @IsOptional()
  bathroomsCount?: number;

  @IsNumber()
  @IsOptional()
  baseRoomsCount?: number;

  @IsArray()
  @IsOptional()
  additionalServices?: string[];

  @IsArray()
  @IsOptional()
  photos?: string[];

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  price: number;

  @IsString()
  @IsNotEmpty()
  datetime: string;

  @IsString()
  @IsNotEmpty()
  homeAccessInstructions: string;

  @IsString()
  @IsOptional()
  homeAccessAdditionalInstructions?: string;
}
