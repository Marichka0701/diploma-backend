import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateServicePackageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  price: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) =>
    value === null || value === undefined ? value : Number(value),
  )
  minArea?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) =>
    value === null || value === undefined ? value : Number(value),
  )
  maxArea?: number | null;

  @IsString({ each: true })
  @IsNotEmpty()
  services: string[];
}
