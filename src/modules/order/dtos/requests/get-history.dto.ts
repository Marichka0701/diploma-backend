import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EHistorySort } from '../../enums/history-sort.enum';
import { EOrderStatus } from '../../enums/order-status.enum';

export class GetHistoryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [value];
  })
  @IsArray()
  @IsEnum(EOrderStatus, { each: true })
  status?: EOrderStatus[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientName?: string;

  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @IsOptional()
  @IsISO8601()
  dateTo?: string;

  @IsOptional()
  @IsUUID()
  servicePackageId?: string;

  @IsOptional()
  @IsEnum(EHistorySort)
  sort?: EHistorySort = EHistorySort.NEWEST;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
