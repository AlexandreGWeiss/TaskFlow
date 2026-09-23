import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, boardId: string) {
    await this.assertBoardAccess(userId, boardId);

    return this.prisma.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
    });
  }

  async create(userId: string, boardId: string, dto: CreateColumnDto) {
    await this.assertBoardAccess(userId, boardId);

    return this.prisma.column.create({
      data: {
        name: dto.name,
        order: dto.order,
        boardId,
      },
    });
  }

  async update(
    userId: string,
    boardId: string,
    columnId: string,
    dto: UpdateColumnDto,
  ) {
    await this.assertBoardAccess(userId, boardId);

    if (dto.name === undefined && dto.order === undefined) {
      throw new BadRequestException('Informe name e/ou order para atualizar');
    }

    const column = await this.prisma.column.findFirst({
      where: { id: columnId, boardId },
      select: { id: true },
    });

    if (!column) {
      throw new NotFoundException('Column não encontrada neste board');
    }

    return this.prisma.column.update({
      where: { id: columnId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async remove(userId: string, boardId: string, columnId: string) {
    await this.assertBoardAccess(userId, boardId);

    const column = await this.prisma.column.findFirst({
      where: { id: columnId, boardId },
      select: { id: true },
    });

    if (!column) {
      throw new NotFoundException('Column não encontrada neste board');
    }

    return this.prisma.column.delete({ where: { id: columnId } });
  }

  private async assertBoardAccess(userId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: {
        ownerId: true,
        members: {
          where: { userId },
          select: { userId: true },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board não encontrado');
    }

    const isOwner = board.ownerId === userId;
    const isMember = board.members.length > 0;

    if (!isOwner && !isMember) {
      throw new ForbiddenException('Você não tem acesso a este board');
    }
  }
}
