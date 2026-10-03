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
    <html lang="pt-BR" data-theme="light" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{const saved=localStorage.getItem("taskflow-theme");const theme=saved==="dark"||saved==="light"?saved:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=theme}catch{document.documentElement.dataset.theme=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100"><Navbar />{children}</body>
    </html>
  );
}
