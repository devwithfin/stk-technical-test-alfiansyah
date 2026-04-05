import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [MenuModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
