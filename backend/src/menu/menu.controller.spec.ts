import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

type MenuServiceMock = {
  [K in keyof MenuService]: jest.MockedFunction<MenuService[K]>;
};

const mockMenuService: MenuServiceMock = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  move: jest.fn(),
  reorder: jest.fn(),
};

describe('MenuController', () => {
  let controller: MenuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuService,
          useValue: mockMenuService,
        },
      ],
    }).compile();

    controller = module.get<MenuController>(MenuController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates findAll', async () => {
    mockMenuService.findAll.mockResolvedValue(['menu']);

    await expect(controller.findAll()).resolves.toEqual(['menu']);
    expect(mockMenuService.findAll).toHaveBeenCalled();
  });

  it('delegates findOne', async () => {
    mockMenuService.findOne.mockResolvedValue({ id: '1' });

    await controller.findOne('1');
    expect(mockMenuService.findOne).toHaveBeenCalledWith('1');
  });

  it('delegates create', async () => {
    const dto = { menu_name: 'Test' } as CreateMenuDto;
    await controller.create(dto);

    expect(mockMenuService.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update', async () => {
    const dto = { menu_name: 'New' } as UpdateMenuDto;
    await controller.update('id-1', dto);

    expect(mockMenuService.update).toHaveBeenCalledWith('id-1', dto);
  });

  it('delegates remove', async () => {
    await controller.remove('id-1');
    expect(mockMenuService.remove).toHaveBeenCalledWith('id-1');
  });

  it('delegates move', async () => {
    await controller.move('menu', { parentId: 'parent' });
    expect(mockMenuService.move).toHaveBeenCalledWith('menu', 'parent');
  });

  it('delegates reorder', async () => {
    await controller.reorder('menu', { order: 3 });
    expect(mockMenuService.reorder).toHaveBeenCalledWith('menu', 3);
  });
});
