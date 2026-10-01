"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/auth";
import { useEffect, useState } from "react";

export function Navbar() {
  const router = useRouter(); const pathname = usePathname(); const [signedIn, setSignedIn] = useState(false);
  useEffect(() => setSignedIn(Boolean(getToken())), [pathname]);
  return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5"><Link href="/boards" className="flex items-center gap-2 font-bold tracking-tight text-slate-900"><span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">T</span> TaskFlow</Link>{signedIn ? <nav className="flex items-center gap-5 text-sm"><Link href="/boards" className="text-slate-600 hover:text-indigo-700">Meus quadros</Link><button className="font-medium text-slate-500 hover:text-slate-900" onClick={() => { clearToken(); router.push("/login"); }}>Sair</button></nav> : <nav className="flex items-center gap-4 text-sm"><Link href="/login" className="text-slate-600">Entrar</Link><Link href="/register" className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white">Criar conta</Link></nav>}</div></header>;
}
