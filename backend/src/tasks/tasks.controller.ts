import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { CreateTaskDto } from './dto/create-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
  };
};

@Controller()
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('boards/:boardId/columns/:columnId/tasks')
  findAll(
    @Req() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.tasksService.findAll(req.user.userId, boardId, columnId);
  }

  @Post('boards/:boardId/columns/:columnId/tasks')
  create(
    @Req() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(
      req.user.userId,
      boardId,
      columnId,
      dto,
    );
  }

  @Patch('boards/:boardId/columns/:columnId/tasks/:taskId')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(
      req.user.userId,
      boardId,
      columnId,
      taskId,
      dto,
    );
  }

  @Delete('boards/:boardId/columns/:columnId/tasks/:taskId')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.remove(
      req.user.userId,
      boardId,
      columnId,
      taskId,
    );
  }

  @Patch('boards/:boardId/tasks/:taskId/move')
  move(
    @Req() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
    @Param('taskId') taskId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.move(req.user.userId, boardId, taskId, dto);
  }
}
