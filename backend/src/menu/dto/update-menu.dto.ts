import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMenuDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  menu_name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  menu_parent?: string | null;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  menu_level?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  @IsOptional()
  menu_order?: number;
}