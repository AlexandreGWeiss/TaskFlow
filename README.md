# TaskFlow

Sistema de gerenciamento de tarefas baseado em Kanban, desenvolvido como projeto acadêmico e prático.

O objetivo do TaskFlow é permitir que usuários organizem projetos, quadros e tarefas de forma simples e colaborativa.

## Tecnologias

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Supabase
- JWT
- Passport
- bcrypt

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- App Router

## Funcionalidades

Atualmente, o backend possui:

- Cadastro de usuários
- Login de usuários
- Autenticação utilizando JWT
- Proteção de rotas autenticadas
- Criação, consulta, atualização e exclusão de Boards
- Criação, consulta, atualização e exclusão de Columns
- Controle de acesso aos Boards e Columns
- Integração com PostgreSQL através do Supabase
- Migrations utilizando Prisma

## Estrutura do projeto

```text
TaskFlow/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   └── src/
│       ├── auth/
│       ├── boards/
│       ├── columns/
│       ├── app.module.ts
│       ├── main.ts
│       └── prisma.service.ts
│
├── frontend/
│
├── .gitignore
└── README.md
```

## Backend

O backend foi desenvolvido utilizando NestJS e segue uma estrutura modular.

Para executar o backend:

```bash
cd backend
npm install
npm run start:dev
```

O servidor utiliza a porta definida no arquivo `.env`.

## Banco de dados

O projeto utiliza PostgreSQL hospedado no Supabase.

O Prisma é utilizado como ORM e para gerenciamento das migrations.

Para gerar o Prisma Client:

```bash
npx prisma generate
```

Para executar migrations em ambiente de desenvolvimento:

```bash
npx prisma migrate dev
```

## Variáveis de ambiente

O backend utiliza variáveis de ambiente para configurações como:

- Conexão com o banco de dados
- Chave secreta do JWT
- Expiração do token
- Porta da aplicação

O arquivo `.env` não deve ser enviado para o GitHub.

Utilize um arquivo `.env.example` como referência para configurar o ambiente local.

## Desenvolvimento

O projeto está sendo desenvolvido de forma incremental.

### Backend

- [x] Configuração inicial do backend
- [x] Configuração do Prisma
- [x] Integração com Supabase
- [x] Cadastro de usuários
- [x] Login de usuários
- [x] Autenticação JWT
- [x] CRUD de Boards
- [x] CRUD de Columns
- [ ] CRUD de Tasks
- [ ] Organização e movimentação de Tasks

### Frontend

- [x] Configuração inicial do Next.js
- [ ] Interface de autenticação
- [ ] Interface de Boards
- [ ] Interface de Columns
- [ ] Interface de Tasks
- [ ] Integração com a API
- [ ] Melhorias de UI/UX

### Finalização

- [ ] Testes
- [ ] Validações
- [ ] Documentação da API
- [ ] Deploy

## Objetivo

O TaskFlow busca oferecer uma aplicação de gerenciamento de tarefas com organização visual através de quadros Kanban, permitindo acompanhar o progresso das atividades de um projeto.

## Status

**Em desenvolvimento.**
