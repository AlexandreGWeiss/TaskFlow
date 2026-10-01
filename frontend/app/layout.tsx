import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "TaskFlow — Gestão de tarefas",
  description: "Organize o trabalho da sua equipe em quadros Kanban.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900"><Navbar />{children}</body>
    </html>
  );
}
