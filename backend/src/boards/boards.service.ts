import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  // Lista os boards onde o usuário é dono OU membro
  async findAllForUser(userId: string) {
    return this.prisma.board.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: { columns: { include: { tasks: true } } },
    });
  }

  async create(userId: string, name: string) {
    return this.prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          name,
          ownerId: userId,
          members: {
            create: { userId, role: 'owner' },
          },
        },
      });

      await tx.column.createMany({
        data: [
          { name: 'A fazer', order: 0, boardId: board.id },
          { name: 'Em andamento', order: 1, boardId: board.id },
          { name: 'Concluído', order: 2, boardId: board.id },
        ],
      });

      return board;
    });
  }

  async findOne(userId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { columns: { include: { tasks: true } }, members: true },
    });

    if (!board) throw new NotFoundException('Board não encontrado');

    const isMember = board.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Você não tem acesso a este board');

    return board;
  }

  async update(userId: string, boardId: string, dto: UpdateBoardDto) {
    if (typeof dto.name !== 'string' || !dto.name.trim()) {
      throw new BadRequestException('O nome do quadro não pode estar vazio');
    }

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { ownerId: true },
    });
    if (!board) throw new NotFoundException('Board não encontrado');
    if (board.ownerId !== userId) {
      throw new ForbiddenException('Só o dono pode renomear o board');
    }

    return this.prisma.board.update({
      where: { id: boardId },
      data: { name: dto.name.trim() },
    });
  }

  async remove(userId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Board não encontrado');
    if (board.ownerId !== userId) throw new ForbiddenException('Só o dono pode excluir o board');

    return this.prisma.board.delete({ where: { id: boardId } });
  }
}
