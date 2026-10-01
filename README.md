# TaskFlow

Sistema colaborativo de gerenciamento de tarefas no formato Kanban.

O TaskFlow permite organizar projetos por quadros (Boards), colunas (Columns) e tarefas (Tasks), com autenticação de usuários e controle de acesso aos quadros.

## Tecnologias

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
│   ├── public/
│   └── ...
└── README.md
```

## Backend

O backend NestJS roda atualmente em `http://localhost:3333`.

### Autenticação

- Registro de usuários
- Login
- Hash de senhas com bcrypt
- Autenticação via JWT
- Proteção de rotas com Passport/JWT

Endpoints:

```http
POST /auth/register
POST /auth/login
```

O login retorna:

```json
{
  "access_token": "JWT"
}
```

Rotas protegidas utilizam:

```http
Authorization: Bearer <token>
```

## Boards

O backend possui operações para:

- Criar Board
- Listar Boards do usuário
- Buscar Board por ID
- Excluir Board

Os Boards possuem controle de acesso por proprietário e membros.

## Columns

```http
GET    /boards/:boardId/columns
POST   /boards/:boardId/columns
PATCH  /boards/:boardId/columns/:columnId
DELETE /boards/:boardId/columns/:columnId
```

## Tasks

```http
GET    /boards/:boardId/columns/:columnId/tasks
POST   /boards/:boardId/columns/:columnId/tasks
PATCH  /boards/:boardId/columns/:columnId/tasks/:taskId
DELETE /boards/:boardId/columns/:columnId/tasks/:taskId
PATCH  /boards/:boardId/tasks/:taskId/move
```

As Tasks pertencem a uma Column e podem ser movimentadas entre Columns.

Quando o `order` não é informado ao criar ou mover uma Task, o backend coloca a Task no final da Column de destino.

## CORS

O backend permite comunicação com o frontend em desenvolvimento através de:

```text
http://localhost:3000
```

Métodos permitidos:

```text
GET
POST
PATCH
DELETE
OPTIONS
```

Headers permitidos:

```text
Authorization
Content-Type
```

## Banco de dados

O projeto utiliza PostgreSQL hospedado no Supabase e Prisma ORM.

Principais modelos:

- User
- Board
- BoardMember
- Column
- Task

Relação principal:

```text
User
 └── Board
      ├── BoardMember
      └── Column
           └── Task
```

As informações de conexão e o segredo JWT são mantidos em variáveis de ambiente e não devem ser versionados.

## Frontend

O frontend oficial está em:

```text
frontend/
```

O frontend ainda está em desenvolvimento. A estrutura inicial foi criada com Next.js, TypeScript, Tailwind CSS e App Router.

Próximas funcionalidades:

1. Tela de Login
2. Tela de Cadastro
3. Integração com JWT
4. Listagem de Boards
5. Criação, abertura e exclusão de Boards
6. Interface Kanban
7. Gerenciamento de Columns
8. Gerenciamento de Tasks
9. Drag-and-drop
10. Melhorias de interface e responsividade

## Como executar

### Backend

```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

Backend:

```text
http://localhost:3333
```

Configure o arquivo `.env` com as variáveis necessárias antes de executar.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

## Status do projeto

### Backend

- [x] Estrutura NestJS
- [x] Prisma
- [x] PostgreSQL/Supabase
- [x] Registro de usuário
- [x] Login
- [x] JWT
- [x] Boards
- [x] BoardMembers
- [x] Columns
- [x] Tasks
- [x] Movimentação de Tasks
- [x] Controle de acesso
- [x] CORS para desenvolvimento

### Frontend

- [x] Projeto Next.js
- [x] TypeScript
- [x] Tailwind CSS
- [x] App Router
- [ ] Autenticação
- [ ] Boards
- [ ] Columns
- [ ] Tasks
- [ ] Interface Kanban
- [ ] Drag-and-drop
- [ ] Integração completa com a API

## Desenvolvimento

O projeto está sendo desenvolvido de forma incremental, validando cada parte antes de avançar para a próxima.

Alterações no backend devem preservar as regras de autenticação e autorização existentes.

## Licença

Projeto desenvolvido para fins acadêmicos e de aprendizado.
