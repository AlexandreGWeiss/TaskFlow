import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

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
    return this.prisma.board.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: { userId, role: 'owner' },
        },
      },
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

  async remove(userId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Board não encontrado');
    if (board.ownerId !== userId) throw new ForbiddenException('Só o dono pode excluir o board');

    return this.prisma.board.delete({ where: { id: boardId } });
  }
}
