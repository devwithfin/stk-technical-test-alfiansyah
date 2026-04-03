import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MenuService {
    constructor(private prisma: PrismaService){}

    async findAll(){
        return this.prisma.menus.findMany({
            orderBy:{
                menu_order: 'asc'
            }
        })
    }
}
