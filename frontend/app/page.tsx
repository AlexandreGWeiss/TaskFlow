"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
export default function Home() { const router = useRouter(); useEffect(() => { router.replace(getToken() ? "/boards" : "/login"); }, [router]); return <main className="grid flex-1 place-items-center text-sm text-slate-500">Abrindo TaskFlow…</main>; }
