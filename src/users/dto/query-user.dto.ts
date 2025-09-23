import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryUserDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo email hoặc tên' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Số trang', default: 1 })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ description: 'Số user mỗi trang', default: 10 })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
