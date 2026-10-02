export class CreateTaskDto {
  title!: string;
  description?: string;
  order?: number;
  dueDate?: string | null;
}
