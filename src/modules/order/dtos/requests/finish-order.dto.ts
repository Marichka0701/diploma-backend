import { IsDecimal, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class FinishOrderDto {
  @IsNotEmpty()
  @IsDecimal()
  @Min(0)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  feedback: string;
}
