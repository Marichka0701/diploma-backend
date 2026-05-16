import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AdditionalServicePricingUnit } from '../../entities/additional-service.entity';

export class CreateAdditionalServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  price: number;

  @IsOptional()
  @IsEnum(AdditionalServicePricingUnit)
  pricingUnit?: AdditionalServicePricingUnit;
}
