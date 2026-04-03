import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MenuService } from './menu.service';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
    constructor(
        private readonly menuService: MenuService
    ){}

    @Post()
    @ApiOperation({summary: 'Create New Menu'})
    createMenu(@Body() body:any){
        return {
            message: 'Succesfully Create Menu'
        }
    }

    @Get()
    @ApiOperation({summary: 'Get All Menu'})
     getMenu(){
        return this.menuService.findAll();
     }
}
