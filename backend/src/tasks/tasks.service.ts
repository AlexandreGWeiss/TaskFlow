import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, boardId: string, columnId: string) {
    await this.assertBoardAccess(userId, boardId);
    await this.assertColumnInBoard(boardId, columnId);

    return this.prisma.task.findMany({
      where: { columnId },
      orderBy: { order: 'asc' },
    });
  }

  async create(
    userId: string,
    boardId: string,
    columnId: string,
    dto: CreateTaskDto,
  ) {
    await this.assertBoardAccess(userId, boardId);
    await this.assertColumnInBoard(boardId, columnId);

    let order = dto.order;
    if (order === undefined) {
      const aggregate = await this.prisma.task.aggregate({
        where: { columnId },
        _max: { order: true },
      });
      order = (aggregate._max.order ?? -1) + 1;
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        order,
        columnId,
      },
    });
  }

  async update(
    userId: string,
    boardId: string,
    columnId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    await this.assertBoardAccess(userId, boardId);
    await this.assertColumnInBoard(boardId, columnId);
    await this.assertTaskInColumn(taskId, columnId);

    if (
      dto.title === undefined &&
      dto.description === undefined &&
      dto.order === undefined
    ) {
      throw new BadRequestException(
        'Informe title, description e/ou order para atualizar',
      );
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async remove(
    userId: string,
    boardId: string,
    columnId: string,
    taskId: string,
  ) {
    await this.assertBoardAccess(userId, boardId);
    await this.assertColumnInBoard(boardId, columnId);
    await this.assertTaskInColumn(taskId, columnId);

    return this.prisma.task.delete({ where: { id: taskId } });
  }

  async move(
    userId: string,
    boardId: string,
    taskId: string,
    dto: MoveTaskDto,
  ) {
    await this.assertBoardAccess(userId, boardId);

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: { select: { boardId: true } } },
    });

    if (!task) {
      throw new NotFoundException('Task não encontrada');
    }
    if (task.column.boardId !== boardId) {
      throw new NotFoundException('Task não encontrada neste board');
    }

    await this.assertColumnInBoard(boardId, dto.targetColumnId);

    let order = dto.order;
    if (order === undefined) {
      const aggregate = await this.prisma.task.aggregate({
        where: { columnId: dto.targetColumnId },
        _max: { order: true },
      });
      order = (aggregate._max.order ?? -1) + 1;
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: dto.targetColumnId,
        order,
      },
    });
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

    if (board.ownerId !== userId && board.members.length === 0) {
      throw new ForbiddenException('Você não tem acesso a este board');
    }
  }

  private async assertColumnInBoard(boardId: string, columnId: string) {
    const column = await this.prisma.column.findFirst({
      where: { id: columnId, boardId },
      select: { id: true },
    });

    if (!column) {
      throw new NotFoundException('Column não encontrada neste board');
    }
  }

  private async assertTaskInColumn(taskId: string, columnId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, columnId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task não encontrada nesta column');
    }
  }
}
