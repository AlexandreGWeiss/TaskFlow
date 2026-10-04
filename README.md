# TaskFlow

Sistema colaborativo de gerenciamento de tarefas no formato **Kanban**, desenvolvido como MVP para a disciplina de **Programação IV**.

O TaskFlow permite que usuários criem e organizem quadros, colunas e tarefas, além de controlar o acesso aos quadros por meio de autenticação e membros.

## Aplicação online

https://task-flow-seven-blush.vercel.app/

## Integrantes

- **Alexandre Gustavo Weiss**
- **Douglas Gabriel Sierota**

## Tecnologias utilizadas

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- App Router

### Backend
- NestJS
- TypeScript
- Prisma ORM
- JWT
- Passport
- bcrypt

### Banco de dados
- PostgreSQL
- Supabase

## Funcionalidades

- Cadastro e login de usuários
- Autenticação utilizando JWT
- Senhas armazenadas com hash utilizando bcrypt
- Proteção de rotas
- Criação, listagem, visualização, renomeação e exclusão de Boards
- Criação, edição e exclusão de Columns
- Criação, edição e exclusão de Tasks
- Movimentação de Tasks entre Columns
- Controle de acesso aos Boards
- Interface Kanban
- Modo claro e escuro
- Integração entre frontend e backend
- Aplicação disponível em ambiente de produção

## Estrutura do projeto

```text
TaskFlow/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── auth/
│       ├── boards/
│       ├── columns/
│       ├── tasks/
│       └── prisma.service.ts
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── ...
└── README.md
```

## Arquitetura

```text
Frontend (Next.js / Vercel)
          |
          | HTTP / REST API
          v
Backend (NestJS / Render)
          |
          | Prisma ORM
          v
PostgreSQL (Supabase)
```

## Autenticação

A autenticação é realizada pelo backend utilizando **JWT (JSON Web Token)**.

### Endpoints

```text
POST /auth/register
POST /auth/login
```

O login retorna:

```json
{
  "access_token": "JWT"
}
```

As rotas protegidas utilizam:

```text
Authorization: Bearer <token>
```

## Boards

Operações disponíveis:

```text
POST   /boards
GET    /boards
GET    /boards/:id
PATCH  /boards/:id
DELETE /boards/:id
```

Funcionalidades:

- Criar Board
- Listar Boards do usuário
- Buscar Board por ID
- Renomear Board
- Excluir Board
- Controle de acesso por proprietário e membros

Ao criar um novo Board, o sistema também cria automaticamente as colunas iniciais do Kanban.

## Columns

```text
GET    /boards/:boardId/columns
POST   /boards/:boardId/columns
PATCH  /boards/:boardId/columns/:columnId
DELETE /boards/:boardId/columns/:columnId
```

As colunas podem ser criadas, editadas e excluídas pelos usuários autorizados.

## Tasks

```text
GET    /boards/:boardId/columns/:columnId/tasks
POST   /boards/:boardId/columns/:columnId/tasks
PATCH  /boards/:boardId/columns/:columnId/tasks/:taskId
DELETE /boards/:boardId/columns/:columnId/tasks/:taskId
PATCH  /boards/:boardId/tasks/:taskId/move
```

As Tasks possuem uma relação com as Columns e podem ser movimentadas entre diferentes colunas do Board.

## Operações CRUD

O projeto implementa operações CRUD para as principais entidades.

### Boards
- **Create** — criação
- **Read** — listagem e consulta
- **Update** — renomeação
- **Delete** — exclusão

### Columns
- **Create** — criação
- **Read** — consulta
- **Update** — edição
- **Delete** — exclusão

### Tasks
- **Create** — criação
- **Read** — consulta
- **Update** — edição
- **Delete** — exclusão

Além das operações CRUD, as Tasks podem ser movimentadas entre Columns.

## Banco de dados

O projeto utiliza **PostgreSQL**, hospedado no **Supabase**, com **Prisma ORM**.

Principais modelos:

- User
- Board
- BoardMember
- Column
- Task

As informações de conexão com o banco e o segredo utilizado pelo JWT são armazenados em variáveis de ambiente e não são versionados.

## Frontend

O frontend foi desenvolvido utilizando Next.js, TypeScript, Tailwind CSS e App Router.

Possui:

- Página de login
- Página de cadastro
- Autenticação
- Listagem, criação, renomeação e exclusão de Boards
- Interface Kanban
- Gerenciamento de Columns
- Gerenciamento de Tasks
- Movimentação de Tasks
- Modo claro e escuro
- Integração com a API do backend
- Interface responsiva

## Backend

O backend foi desenvolvido utilizando **NestJS** e possui arquitetura organizada por módulos:

```text
auth/
boards/
columns/
tasks/
```

O backend é responsável por autenticação, autorização, gerenciamento das entidades, API REST, controle de acesso e comunicação com PostgreSQL através do Prisma.

## Deploy

### Frontend

**Vercel**

https://task-flow-seven-blush.vercel.app/

### Backend

**Render**

O backend NestJS está hospedado em ambiente de produção e é consumido pelo frontend através de uma API REST.

### Banco de dados

**Supabase**

O banco PostgreSQL utilizado pela aplicação está hospedado no Supabase.

## Como executar localmente

### Pré-requisitos

- Node.js
- npm
- Git
- Acesso ao banco PostgreSQL utilizado pelo projeto

### Clonar o repositório

```bash
git clone https://github.com/AlexandreGWeiss/TaskFlow.git
cd TaskFlow
```

### Backend

```bash
cd backend
npm install
npx prisma generate
```

Configure as variáveis de ambiente necessárias no arquivo `.env`.

Depois execute:

```bash
npm run start:dev
```

Backend local:

```text
http://localhost:3333
```

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
```

Configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Depois execute:

```bash
npm run dev
```

Frontend local:

```text
http://localhost:3000
```

## Variáveis de ambiente

As informações sensíveis são mantidas em variáveis de ambiente, incluindo:

- Conexão com o banco de dados
- URL da API
- Segredo utilizado pelo JWT
- Configurações de ambiente

Essas informações não devem ser adicionadas ao repositório Git.

## Status do projeto

### Backend

- [x] Estrutura NestJS
- [x] Prisma ORM
- [x] PostgreSQL / Supabase
- [x] Registro de usuário
- [x] Login
- [x] JWT
- [x] Boards
- [x] BoardMembers
- [x] Columns
- [x] Tasks
- [x] Movimentação de Tasks
- [x] Controle de acesso
- [x] API REST
- [x] CORS
- [x] Deploy

### Frontend

- [x] Next.js
- [x] TypeScript
- [x] Tailwind CSS
- [x] App Router
- [x] Autenticação
- [x] Boards
- [x] Columns
- [x] Tasks
- [x] Interface Kanban
- [x] Movimentação de Tasks
- [x] Integração com a API
- [x] Modo claro e escuro
- [x] Deploy

## Vídeo de apresentação

Vídeo de apresentação do MVP:

**Link:** https://youtu.be/pvTciefc0NQ

## Projeto acadêmico

Projeto desenvolvido como atividade final da disciplina de **Programação IV**.

## Licença

Projeto desenvolvido para fins acadêmicos e de aprendizado.
