import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  coverLetter: string;
}
