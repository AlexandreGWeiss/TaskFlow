-- AlterTable
ALTER TABLE "Column" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#e2e8f0';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "dueDate" TIMESTAMP(3);
