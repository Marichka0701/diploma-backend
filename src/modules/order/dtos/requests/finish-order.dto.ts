import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class FinishOrderDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  feedback: string;
}
