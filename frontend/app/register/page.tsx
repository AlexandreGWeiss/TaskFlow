import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
export default function RegisterPage() { return <div className="grid flex-1 place-items-center px-5 py-12"><Suspense fallback={<p>Carregando…</p>}><AuthForm mode="register" /></Suspense></div>; }
