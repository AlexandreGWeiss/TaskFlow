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
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
  };
};

@Controller('boards/:boardId/columns')
@UseGuards(AuthGuard('jwt'))
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
  ) {
    return this.columnsService.findAll(req.user.userId, boardId);
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
    @Body() dto: CreateColumnDto,
  ) {
    return this.columnsService.create(req.user.userId, boardId, dto);
  }

  @Patch(':columnId')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnsService.update(
      req.user.userId,
      boardId,
      columnId,
      dto,
    );
  }

  @Delete(':columnId')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.columnsService.remove(req.user.userId, boardId, columnId);
  }
}
