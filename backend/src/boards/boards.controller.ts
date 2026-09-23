import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // requer @nestjs/passport + passport-jwt instalados
import type { Request } from 'express';
import { BoardsService } from './boards.service';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
  };
};

@Controller('boards')
@UseGuards(AuthGuard('jwt')) // protege todas as rotas: só usuário logado acessa
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.boardsService.findAllForUser(req.user.userId);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() body: { name: string }) {
    return this.boardsService.create(req.user.userId, body.name);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.boardsService.findOne(req.user.userId, id);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.boardsService.remove(req.user.userId, id);
  }
}
