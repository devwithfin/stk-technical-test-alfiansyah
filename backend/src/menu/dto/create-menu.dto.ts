import { IsString, IsOptional, IsInt, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ example: 'Menu A' })
  @IsString()
  @IsNotEmpty()
  menu_name: string;

  @ApiPropertyOptional({ example: null })
  @IsString()
  @IsOptional()
  menu_parent?: string | null;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  menu_level?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @Max(999)
  menu_order?: number;
}