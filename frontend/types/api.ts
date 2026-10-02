export type Board = { id: string; name: string; ownerId: string; createdAt: string; columns?: Column[]; members?: BoardMember[] };
export type BoardMember = { id: string; userId: string; role: string };
export type Column = { id: string; name: string; order: number; color: string; boardId: string; tasks?: Task[] };
export type Task = { id: string; title: string; description: string | null; order: number; dueDate: string | null; columnId: string; createdAt?: string };
export type AuthResponse = { access_token: string };
export type ApiErrorBody = { message?: string | string[] };
