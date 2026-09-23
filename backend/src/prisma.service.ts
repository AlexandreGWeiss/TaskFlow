import "dotenv/config";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Serviço único do Prisma, injetado em todos os módulos que precisam do banco.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env["DATABASE_URL"];

    if (!connectionString) {
      throw new Error("DATABASE_URL nÃ£o estÃ¡ configurada");
    }

    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
