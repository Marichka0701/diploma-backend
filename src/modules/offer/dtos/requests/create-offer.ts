import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsUUID()
  applicationId: string;
}
