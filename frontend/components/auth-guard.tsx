"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getToken } from "@/lib/auth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter(); const pathname = usePathname(); const [ready, setReady] = useState(false);
  useEffect(() => { if (!getToken()) router.replace(`/login?next=${encodeURIComponent(pathname)}`); else setReady(true); }, [pathname, router]);
  if (!ready) return <div className="grid min-h-[60vh] place-items-center text-sm text-slate-500 dark:text-slate-400">Carregando…</div>;
  return children;
}
