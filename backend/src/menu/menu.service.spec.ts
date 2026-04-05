import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { MenuService, type MenuWithChildren } from './menu.service';

const mockFn = () => jest.fn();

const mockPrismaService = {
  menus: {
    findMany: mockFn(),
    findUnique: mockFn(),
    count: mockFn(),
    create: mockFn(),
    update: mockFn(),
    deleteMany: mockFn(),
  },
};

const buildMenu = (overrides: Partial<MenuWithChildren> = {}): MenuWithChildren => ({
  id: overrides.id ?? 'menu-id',
  menu_name: overrides.menu_name ?? 'Menu',
  menu_parent: overrides.menu_parent ?? null,
  menu_level: overrides.menu_level ?? 1,
  menu_order: overrides.menu_order ?? 1,
  createdAt: overrides.createdAt ?? new Date('2024-01-01'),
  updatedAt: overrides.updatedAt ?? new Date('2024-01-02'),
  children: overrides.children,
});

describe('MenuService', () => {
  let service: MenuService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: PrismaService,
          useValue: mockPrismaService as PrismaService,
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    prisma = mockPrismaService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds a hierarchical tree on findAll', async () => {
    const parent = buildMenu({ id: 'parent', menu_parent: null });
    const child = buildMenu({ id: 'child', menu_parent: 'parent' });
    prisma.menus.findMany.mockResolvedValue([parent, child]);

    const result = await service.findAll();

    expect(prisma.menus.findMany).toHaveBeenCalledWith({ orderBy: { menu_order: 'asc' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('parent');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children?.[0].id).toBe('child');
  });

  it('findOne returns menu when exists', async () => {
    const menu = buildMenu({ id: 'menu-1' });
    prisma.menus.findUnique.mockResolvedValue(menu);

    await expect(service.findOne('menu-1')).resolves.toEqual(menu);
  });

  it('findOne throws when menu not found', async () => {
    prisma.menus.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create assigns root level defaults', async () => {
    const dto = { menu_name: 'Root Menu', menu_parent: null };
    prisma.menus.count.mockResolvedValue(1);
    const created = buildMenu({ id: 'new', menu_level: 1, menu_parent: null, menu_order: 2 });
    prisma.menus.create.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(prisma.menus.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        menu_name: 'Root Menu',
        menu_parent: null,
        menu_level: 1,
        menu_order: 2,
      }),
    });
    expect(result).toEqual(created);
  });

  it('create inherits parent level', async () => {
    const parent = buildMenu({ id: 'parent', menu_level: 2 });
    prisma.menus.findUnique.mockResolvedValue(parent);
    prisma.menus.count.mockResolvedValue(3);
    prisma.menus.create.mockResolvedValue(
      buildMenu({ id: 'child', menu_parent: 'parent', menu_level: 3, menu_order: 4 }),
    );

    await service.create({ menu_name: 'Child', menu_parent: 'parent' });

    expect(prisma.menus.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ menu_parent: 'parent', menu_level: 3, menu_order: 4 }),
    });
  });

  it('update recalculates menu level when parent changes', async () => {
    prisma.menus.findUnique
      .mockResolvedValueOnce(buildMenu({ id: 'child', menu_level: 2 })) // existing menu
      .mockResolvedValueOnce(buildMenu({ id: 'new-parent', menu_level: 1 })); // new parent
    prisma.menus.update.mockResolvedValue(buildMenu({ id: 'child', menu_level: 2 }));

    await service.update('child', { menu_parent: 'new-parent' });

    expect(prisma.menus.update).toHaveBeenCalledWith({
      where: { id: 'child' },
      data: expect.objectContaining({ menu_parent: 'new-parent', menu_level: 2 }),
    });
  });

  it('remove deletes menu and descendants', async () => {
    prisma.menus.findUnique.mockResolvedValue(buildMenu({ id: 'root' }));
    prisma.menus.findMany.mockResolvedValue([
      buildMenu({ id: 'root', menu_parent: null }),
      buildMenu({ id: 'child-a', menu_parent: 'root' }),
      buildMenu({ id: 'child-b', menu_parent: 'child-a' }),
    ]);

    await service.remove('root');

    expect(prisma.menus.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['root', 'child-a', 'child-b'] } },
    });
  });

  it('move prevents assigning itself as parent', async () => {
    prisma.menus.findUnique.mockResolvedValue(buildMenu({ id: 'node', menu_level: 1 }));

    await expect(service.move('node', 'node')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('move prevents moving into own descendants', async () => {
    prisma.menus.findUnique
      .mockResolvedValueOnce(buildMenu({ id: 'node' })) // current node
      .mockResolvedValueOnce(buildMenu({ id: 'child' })); // new parent
    prisma.menus.findMany.mockResolvedValue([
      buildMenu({ id: 'node', menu_parent: null }),
      buildMenu({ id: 'child', menu_parent: 'node' }),
    ]);

    await expect(service.move('node', 'child')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('reorder updates menu order', async () => {
    prisma.menus.findUnique.mockResolvedValue(buildMenu({ id: 'node', menu_order: 1 }));
    prisma.menus.update.mockResolvedValue(buildMenu({ id: 'node', menu_order: 10 }));

    await service.reorder('node', 10);

    expect(prisma.menus.update).toHaveBeenCalledWith({
      where: { id: 'node' },
      data: { menu_order: 10 },
    });
  });
});
