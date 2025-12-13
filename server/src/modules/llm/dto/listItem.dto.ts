import { IsString } from 'class-validator';

export class listItemsDto {
  @IsString() item: string;
  @IsString() quantity: number;
}
