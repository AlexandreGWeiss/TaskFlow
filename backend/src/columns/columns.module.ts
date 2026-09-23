import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';

@Module({
  controllers: [ColumnsController],
  providers: [ColumnsService, PrismaService],
})
export class ColumnsModule {}
