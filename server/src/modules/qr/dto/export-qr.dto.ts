import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ExportQrDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Danh sách thiết bị phải có ít nhất 1 phần tử' })
  @IsString({ each: true })
  ids!: string[];
}
