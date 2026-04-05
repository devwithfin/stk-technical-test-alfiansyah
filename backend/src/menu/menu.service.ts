import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MenuWithChildren {
  id: string;
  menu_name: string;
  menu_parent: string | null;
  menu_level: number;
  menu_order: number;
  createdAt: Date;
  updatedAt: Date;
  children?: MenuWithChildren[];
}
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const allMenus = await this.prisma.menus.findMany({
      orderBy: { menu_order: 'asc' },
    });
    return this.buildTree(allMenus);
  }

  async findOne(id: string) {
    const menu = await this.prisma.menus.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }
    return menu;
  }

  async create(data: CreateMenuDto) {
    const menu_parent = data.menu_parent ?? null;
    let menu_level = 0;
    if (menu_parent) {
      const parent = await this.findOne(menu_parent);
      menu_level = parent.menu_level + 1;
    } else {
      menu_level = 1;
    }

    const siblingCount = await this.prisma.menus.count({
      where: { menu_parent },
    });

    return this.prisma.menus.create({
      data: {
        menu_name: data.menu_name,
        menu_parent,
        menu_level,
        menu_order: siblingCount + 1,
      },
    });
  }

  async update(id: string, data: UpdateMenuDto) {
    await this.findOne(id);
    let menu_level: number | undefined;
    if (data.menu_parent) {
      const parent = await this.findOne(data.menu_parent);
      menu_level = parent.menu_level + 1;
    }
    return this.prisma.menus.update({
      where: { id },
      data: {
        ...data,
        menu_level,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const descendants = await this.getDescendants(id);
    const idsToDelete = [id, ...descendants.map((d) => d.id)];
    await this.prisma.menus.deleteMany({
      where: { id: { in: idsToDelete } },
    });
    return { message: 'Menu and children deleted successfully' };
  }

  async move(id: string, newParentId: string | null) {
    const menu = await this.findOne(id);
    if (newParentId) {
      const newParent = await this.findOne(newParentId);
      if (newParentId === id) {
        throw new BadRequestException('Menu cannot be its own parent');
      }
      const descendants = await this.getDescendants(id);
      if (descendants.some((d) => d.id === newParentId)) {
        throw new BadRequestException('Cannot move menu to its own descendant');
      }
      await this.prisma.menus.update({
        where: { id },
        data: { menu_parent: newParentId, menu_level: newParent.menu_level + 1 },
      });
    } else {
      await this.prisma.menus.update({
        where: { id },
        data: { menu_parent: null, menu_level: 0 },
      });
    }
    return this.findOne(id);
  }

  async reorder(id: string, newOrder: number) {
    await this.findOne(id);
    await this.prisma.menus.update({
      where: { id },
      data: { menu_order: newOrder },
    });
    return this.findOne(id);
  }

  private async getDescendants(id: string): Promise<MenuWithChildren[]> {
    const allMenus = await this.prisma.menus.findMany();
    const descendants: MenuWithChildren[] = [];
    const queue = [id];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = allMenus.filter((m) => m.menu_parent === currentId);
      children.forEach((c) => {
        descendants.push(c);
        queue.push(c.id);
      });
    }
    return descendants;
  }

  private buildTree(menus: MenuWithChildren[]): MenuWithChildren[] {
    const menuMap = new Map<string, MenuWithChildren>();
    const roots: MenuWithChildren[] = [];

    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    menus.forEach((menu) => {
      const menuNode = menuMap.get(menu.id)!;
      if (menu.menu_parent && menuMap.has(menu.menu_parent)) {
        menuMap.get(menu.menu_parent)!.children!.push(menuNode);
      } else {
        roots.push(menuNode);
      }
    });

    return roots;
  }
}
