"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Modal } from "@/components/modal";
import { api, json } from "@/lib/api";
import type { Board } from "@/types/api";

type BoardAction = { kind: "rename" | "delete"; board: Board } | null;

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [action, setAction] = useState<BoardAction>(null);
  const [actionError, setActionError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setBoards(await api<Board[]>("/boards"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar os quadros.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!openMenuId) return;
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpenMenuId(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenuId(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenuId]);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const name = new FormData(e.currentTarget).get("name");
    try {
      await api<Board>("/boards", json("POST", { name }));
      setShowCreate(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar quadro.");
    } finally {
      setSaving(false);
    }
  }

  async function rename(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (action?.kind !== "rename") return;
    setSaving(true);
    const name = new FormData(e.currentTarget).get("name");
    try {
      const updated = await api<Board>(`/boards/${action.board.id}`, json("PATCH", { name }));
      setBoards((items) => items.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
      setAction(null);
      setError("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao renomear quadro.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (action?.kind !== "delete") return;
    setSaving(true);
    try {
      await api(`/boards/${action.board.id}`, json("DELETE"));
      setBoards((items) => items.filter((item) => item.id !== action.board.id));
      setAction(null);
      setError("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao excluir quadro.");
    } finally {
      setSaving(false);
    }
  }

  return <AuthGuard><main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-semibold text-indigo-600">ESPAÇO DE TRABALHO</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Meus quadros</h1><p className="mt-2 text-slate-500">Acompanhe o trabalho da sua equipe em um só lugar.</p></div>
      <button onClick={() => setShowCreate(true)} className="primary-button">＋ Novo quadro</button>
    </div>
    {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {busy ? <p className="py-16 text-center text-slate-500">Carregando quadros…</p> : boards.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"><div className="text-4xl">▤</div><h2 className="mt-4 font-semibold">Seu espaço começa aqui</h2><p className="mt-1 text-sm text-slate-500">Crie um quadro para organizar as tarefas do time.</p><button onClick={() => setShowCreate(true)} className="secondary-button mt-5">Criar primeiro quadro</button></div> : <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => <article key={board.id} className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <Link href={`/boards/${board.id}`} className="block"><span className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-xl text-indigo-700">▤</span><h2 className="mt-4 pr-8 font-semibold text-slate-900">{board.name}</h2><p className="mt-1 text-sm text-slate-500">{board.columns?.length ?? 0} colunas</p></Link>
        <div ref={openMenuId === board.id ? menuRef : null} className="absolute right-4 top-4">
          <button type="button" aria-label={`Ações do quadro ${board.name}`} aria-haspopup="menu" aria-expanded={openMenuId === board.id} aria-controls={`board-menu-${board.id}`} title="Ações do quadro" onClick={() => setOpenMenuId((current) => current === board.id ? null : board.id)} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600">•••</button>
          {openMenuId === board.id && <div id={`board-menu-${board.id}`} role="menu" aria-label={`Ações do quadro ${board.name}`} className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            <button type="button" role="menuitem" onClick={() => { setOpenMenuId(null); setActionError(""); setAction({ kind: "rename", board }); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50">Renomear quadro</button>
            <button type="button" role="menuitem" onClick={() => { setOpenMenuId(null); setActionError(""); setAction({ kind: "delete", board }); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 focus-visible:bg-red-50">Excluir quadro</button>
          </div>}
        </div>
      </article>)}
    </div>}
    {showCreate && <Modal title="Criar quadro" close={() => setShowCreate(false)}><form onSubmit={create} className="space-y-4"><label className="field-label">Nome do quadro<input autoFocus required name="name" maxLength={80} placeholder="Ex.: Lançamento do produto" className="field-input" /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setShowCreate(false)} className="secondary-button">Cancelar</button><button disabled={saving} className="primary-button">{saving ? "Criando…" : "Criar quadro"}</button></div></form></Modal>}
    {action?.kind === "rename" && <Modal title="Renomear quadro" close={() => !saving && setAction(null)}>{actionError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}<form onSubmit={rename} className="space-y-4"><label className="field-label">Nome do quadro<input autoFocus required name="name" maxLength={80} defaultValue={action.board.name} className="field-input" /></label><div className="flex justify-end gap-2"><button type="button" disabled={saving} onClick={() => setAction(null)} className="secondary-button">Cancelar</button><button disabled={saving} className="primary-button">{saving ? "Salvando…" : "Salvar"}</button></div></form></Modal>}
    {action?.kind === "delete" && <Modal title="Excluir quadro" close={() => !saving && setAction(null)}>{actionError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}<p className="text-sm leading-6 text-slate-600">Tem certeza de que deseja excluir o quadro <strong className="text-slate-900">{action.board.name}</strong>? Esta ação é irreversível e todas as colunas e tarefas do quadro serão removidas.</p><div className="mt-6 flex justify-end gap-2"><button type="button" disabled={saving} onClick={() => setAction(null)} className="secondary-button">Cancelar</button><button type="button" disabled={saving} onClick={() => void remove()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{saving ? "Excluindo…" : "Excluir quadro"}</button></div></Modal>}
  </main></AuthGuard>;
}
