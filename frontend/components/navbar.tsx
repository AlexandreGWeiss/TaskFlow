"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/auth";
import { useEffect, useLayoutEffect, useState } from "react";

type Theme = "light" | "dark";
const THEME_KEY = "taskflow-theme";

function getInitialTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Fall back to the system preference when local storage is unavailable.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function Navbar() {
  const router = useRouter(); const pathname = usePathname(); const [signedIn, setSignedIn] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => setSignedIn(Boolean(getToken())), [pathname]);

  useLayoutEffect(() => {
    const currentTheme = getInitialTheme();
    document.documentElement.dataset.theme = currentTheme;
    setTheme(currentTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // The current page still changes theme if persistence is unavailable.
    }
  }

  return <header className="border-b border-slate-200 bg-white transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5"><Link href="/boards" className="flex items-center gap-2 font-bold tracking-tight text-slate-900 dark:text-slate-100"><span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">T</span> TaskFlow</Link><div className="flex items-center gap-4">{signedIn ? <nav className="flex items-center gap-5 text-sm"><Link href="/boards" className="text-slate-600 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-300">Meus quadros</Link><button className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white" onClick={() => { clearToken(); router.push("/login"); }}>Sair</button></nav> : <nav className="flex items-center gap-4 text-sm"><Link href="/login" className="text-slate-600 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-300">Entrar</Link><Link href="/register" className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500">Criar conta</Link></nav>}<button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"} aria-pressed={theme === "dark"} title={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"} className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-200 dark:hover:bg-slate-700"><span aria-hidden="true" className="text-lg">{theme === "dark" ? "☀" : "☾"}</span></button></div></div></header>;
}
