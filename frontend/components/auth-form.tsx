"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import type { AuthResponse } from "@/types/api";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter(); const params = useSearchParams(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setBusy(true); const data = new FormData(event.currentTarget); const payload = Object.fromEntries(data.entries());
    try { const result = await api<AuthResponse>(`/auth/${mode}`, { method: "POST", body: JSON.stringify(payload) }, false); saveToken(result.access_token); router.replace(mode === "login" ? params.get("next") || "/boards" : "/boards"); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível concluir."); } finally { setBusy(false); }
  }
  const register = mode === "register";
  return <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-7"><p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">TASKFLOW</p><h1 className="mt-2 text-2xl font-bold tracking-tight">{register ? "Crie sua conta" : "Boas-vindas de volta"}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{register ? "Organize seu trabalho em equipe." : "Entre para continuar com seus quadros."}</p></div><form onSubmit={submit} className="space-y-4">{register && <label className="field-label">Nome<input name="name" required autoComplete="name" className="field-input" /></label>}<label className="field-label">E-mail<input name="email" type="email" required autoComplete="email" className="field-input" /></label><label className="field-label">Senha<input name="password" type="password" required minLength={6} autoComplete={register ? "new-password" : "current-password"} className="field-input" /></label>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/60 dark:text-red-200">{error}</p>}<button disabled={busy} className="primary-button w-full">{busy ? "Aguarde…" : register ? "Criar conta" : "Entrar"}</button></form><p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{register ? "Já tem uma conta? " : "Ainda não tem uma conta? "}<Link className="font-semibold text-indigo-700 hover:underline dark:text-indigo-300" href={register ? "/login" : "/register"}>{register ? "Entrar" : "Cadastre-se"}</Link></p></section>;
}
