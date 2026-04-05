import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get all menu' })
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu' })
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new menu' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update menu' })
  update(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu' })
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move menu' })
  move(
    @Param('id') id: string,
    @Body() body: { parentId: string | null },
  ) {
    return this.menuService.move(id, body.parentId);
  }

  @Patch(':id/reorder')
  @ApiOperation({ summary: 'Reorder menu' })
  reorder(
    @Param('id') id: string,
    @Body() body: { order: number },
  ) {
    return this.menuService.reorder(id, body.order);
  }
}