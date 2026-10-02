"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { Modal } from "@/components/modal";
import { api, json } from "@/lib/api";
import type { Board, Column, Task } from "@/types/api";

type Editor = { kind: "column"; column?: Column } | { kind: "task"; column: Column; task?: Task };

const COLUMN_COLORS = [
  { name: "Cinza", value: "#e2e8f0" },
  { name: "Vermelho", value: "#fee2e2" },
  { name: "Laranja", value: "#ffedd5" },
  { name: "Amarelo", value: "#fef3c7" },
  { name: "Verde", value: "#dcfce7" },
  { name: "Ciano", value: "#cffafe" },
  { name: "Azul", value: "#dbeafe" },
  { name: "Índigo", value: "#e0e7ff" },
  { name: "Roxo", value: "#f3e8ff" },
  { name: "Rosa", value: "#fce7f3" },
];

function localDateKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<{ task: Task; sourceColumnId: string } | null>(null);
  const [openTaskMenuId, setOpenTaskMenuId] = useState<string | null>(null);
  const [openColumnMenuId, setOpenColumnMenuId] = useState<string | null>(null);
  const [colorPickerColumnId, setColorPickerColumnId] = useState<string | null>(null);
  const taskMenuRef = useRef<HTMLDivElement>(null);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [loadedBoard, loadedColumns] = await Promise.all([
        api<Board>(`/boards/${boardId}`),
        api<Column[]>(`/boards/${boardId}/columns`),
      ]);
      const columnsWithTasks = await Promise.all(loadedColumns.map(async (column) => ({
        ...column,
        tasks: await api<Task[]>(`/boards/${boardId}/columns/${column.id}/tasks`),
      })));
      columnsWithTasks.forEach((column) => column.tasks?.sort((a, b) => a.order - b.order));
      setBoard(loadedBoard);
      setColumns(columnsWithTasks.sort((a, b) => a.order - b.order));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar o quadro.");
    } finally {
      setBusy(false);
    }
  }, [boardId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!openTaskMenuId && !openColumnMenuId && !colorPickerColumnId) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!taskMenuRef.current?.contains(target)) setOpenTaskMenuId(null);
      if (!columnMenuRef.current?.contains(target)) setOpenColumnMenuId(null);
      if (!colorPickerRef.current?.contains(target)) setColorPickerColumnId(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenTaskMenuId(null);
        setOpenColumnMenuId(null);
        setColorPickerColumnId(null);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openTaskMenuId, openColumnMenuId, colorPickerColumnId]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      if (editor.kind === "column") {
        const name = String(form.get("name"));
        if (editor.column) {
          await api(`/boards/${boardId}/columns/${editor.column.id}`, json("PATCH", { name }));
        } else {
          await api(`/boards/${boardId}/columns`, json("POST", { name, order: columns.length }));
        }
      } else {
        const title = String(form.get("title"));
        const description = String(form.get("description") || "");
        const dateValue = String(form.get("dueDate") || "");
        const dueDate = dateValue || null;
        if (editor.task) {
          await api(`/boards/${boardId}/columns/${editor.column.id}/tasks/${editor.task.id}`, json("PATCH", { title, description, dueDate }));
        } else {
          await api(`/boards/${boardId}/columns/${editor.column.id}/tasks`, json("POST", {
            title,
            description,
            ...(dueDate ? { dueDate } : {}),
          }));
        }
      }
      setEditor(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteColumn(column: Column) {
    if (!window.confirm(`Excluir “${column.name}” e todas as tarefas dela?`)) return;
    try {
      await api(`/boards/${boardId}/columns/${column.id}`, json("DELETE"));
      setColumns((items) => items.filter((item) => item.id !== column.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao excluir coluna.");
    }
  }

  async function deleteTask(column: Column, task: Task) {
    if (!window.confirm(`Excluir a tarefa “${task.title}”?`)) return;
    try {
      await api(`/boards/${boardId}/columns/${column.id}/tasks/${task.id}`, json("DELETE"));
      setColumns((items) => items.map((item) => item.id === column.id
        ? { ...item, tasks: item.tasks?.filter((current) => current.id !== task.id) }
        : item));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao excluir tarefa.");
    }
  }

  async function saveColumnColor(column: Column, color: string) {
    setColorPickerColumnId(null);
    try {
      await api(`/boards/${boardId}/columns/${column.id}`, json("PATCH", { color }));
      setColumns((items) => items.map((item) => item.id === column.id ? { ...item, color } : item));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao alterar a cor.");
    }
  }

  async function clearTaskDueDate(column: Column, task: Task) {
    setOpenTaskMenuId(null);
    try {
      await api(`/boards/${boardId}/columns/${column.id}/tasks/${task.id}`, json("PATCH", { dueDate: null }));
      setColumns((items) => items.map((item) => item.id === column.id ? {
        ...item,
        tasks: item.tasks?.map((current) => current.id === task.id ? { ...current, dueDate: null } : current),
      } : item));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao remover a data limite.");
    }
  }

  async function moveTaskToColumn(task: Task, sourceColumnId: string, target: Column, before?: Task) {
    const tasks = [...(target.tasks ?? [])].filter((item) => item.id !== task.id);
    const index = before ? tasks.findIndex((item) => item.id === before.id) : tasks.length;
    tasks.splice(index < 0 ? tasks.length : index, 0, { ...task, columnId: target.id });
    setColumns((items) => items.map((column) => column.id === sourceColumnId
      ? { ...column, tasks: column.tasks?.filter((item) => item.id !== task.id) }
      : column.id === target.id ? { ...column, tasks } : column));
    try {
      await api(`/boards/${boardId}/tasks/${task.id}/move`, json("PATCH", { targetColumnId: target.id }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao mover tarefa.");
      await load();
    }
  }

  async function dropOn(target: Column, before?: Task) {
    if (!dragging) return;
    const { task, sourceColumnId } = dragging;
    setDragging(null);
    if (sourceColumnId === target.id) {
      const tasks = [...(target.tasks ?? [])].filter((item) => item.id !== task.id);
      const index = before ? tasks.findIndex((item) => item.id === before.id) : tasks.length;
      tasks.splice(index < 0 ? tasks.length : index, 0, task);
      setColumns((items) => items.map((column) => column.id === target.id
        ? { ...column, tasks: tasks.map((item, order) => ({ ...item, order })) }
        : column));
      try {
        await Promise.all(tasks.map((item, order) => api(
          `/boards/${boardId}/columns/${target.id}/tasks/${item.id}`,
          json("PATCH", { order }),
        )));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha ao reordenar tarefas.");
        await load();
      }
      return;
    }
    await moveTaskToColumn(task, sourceColumnId, target, before);
  }

  function nextColumn(column: Column) {
    const index = columns.findIndex((item) => item.id === column.id);
    return index >= 0 && index < 2 ? columns[index + 1] : undefined;
  }

  function nextColumnActionLabel(column: Column) {
    return columns.findIndex((item) => item.id === column.id) === 0
      ? "Mover para Em andamento"
      : "Mover para Concluído";
  }

  return (
    <AuthGuard>
      <main className="mx-auto w-full max-w-[1500px] flex-1 px-5 py-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/boards" className="text-sm text-slate-500 hover:text-indigo-700">← Meus quadros</Link>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{board?.name ?? "Quadro"}</h1>
          </div>
          <button onClick={() => setEditor({ kind: "column" })} className="primary-button">＋ Adicionar coluna</button>
        </div>
        {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {busy ? <div className="py-16 text-center text-slate-500">Carregando quadro…</div> : (
          <div className="flex min-h-[55vh] items-start gap-4 overflow-x-auto pb-6">
            {columns.map((column) => (
              <section
                key={column.id}
                style={{ backgroundColor: column.color || "#e2e8f0" }}
                className="w-[min(86vw,330px)] shrink-0 rounded-2xl p-3"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => { event.preventDefault(); void dropOn(column); }}
              >
                <header className="relative mb-3 flex items-center justify-between gap-2 px-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <h2 className="truncate font-semibold">{column.name}</h2>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{column.tasks?.length ?? 0}</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="relative" ref={openColumnMenuId === column.id ? columnMenuRef : null}>
                      <button
                        type="button"
                        aria-label={`Opções da coluna ${column.name}`}
                        aria-haspopup="menu"
                        aria-expanded={openColumnMenuId === column.id}
                        aria-controls={`column-menu-${column.id}`}
                        title="Opções da coluna"
                        onClick={() => {
                          setOpenColumnMenuId((current) => current === column.id ? null : column.id);
                          setColorPickerColumnId(null);
                        }}
                        className="grid size-8 place-items-center rounded-lg text-lg leading-none text-slate-600 hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-indigo-600"
                      >⋮</button>
                      {openColumnMenuId === column.id && (
                        <div id={`column-menu-${column.id}`} role="menu" aria-label={`Opções da coluna ${column.name}`} className="absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                          <button type="button" role="menuitem" onClick={() => { setOpenColumnMenuId(null); setEditor({ kind: "column", column }); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50">Editar nome</button>
                          <button type="button" role="menuitem" onClick={() => { setOpenColumnMenuId(null); setColorPickerColumnId(column.id); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50">Alterar cor</button>
                        </div>
                      )}
                    </div>
                    <button aria-label={`Excluir ${column.name}`} onClick={() => void deleteColumn(column)} className="icon-button hover:text-red-600">×</button>
                    {colorPickerColumnId === column.id && (
                      <div ref={colorPickerRef} aria-label={`Cores da coluna ${column.name}`} className="absolute right-0 top-full z-30 mt-2 grid w-40 grid-cols-5 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                        {COLUMN_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            aria-label={color.name}
                            aria-pressed={column.color === color.value}
                            title={color.name}
                            onClick={() => void saveColumnColor(column, color.value)}
                            className="size-6 rounded-full border border-slate-300 ring-offset-2 hover:ring-2 hover:ring-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600"
                            style={{ backgroundColor: color.value }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </header>
                <div className="min-h-20 space-y-2 rounded-xl" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); event.stopPropagation(); void dropOn(column); }}>
                  {column.tasks?.map((task) => {
                    const targetColumn = nextColumn(column);
                    const dueDate = task.dueDate?.slice(0, 10);
                    const isOverdue = Boolean(dueDate && dueDate < localDateKey() && columns.findIndex((item) => item.id === column.id) !== 2);
                    return (
                      <article
                        key={task.id}
                        draggable
                        onDragStart={() => setDragging({ task, sourceColumnId: column.id })}
                        onDragEnd={() => setDragging(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => { event.preventDefault(); event.stopPropagation(); void dropOn(column, task); }}
                        className={`cursor-grab rounded-xl border border-slate-200 bg-white p-4 shadow-sm active:cursor-grabbing ${dragging?.task.id === task.id ? "opacity-40" : ""}`}
                      >
                        <div className="flex justify-between gap-2">
                          <button onClick={() => setEditor({ kind: "task", column, task })} className="text-left font-medium text-slate-800 hover:text-indigo-700">{task.title}</button>
                          <div className="flex shrink-0 items-start gap-1">
                            <div ref={openTaskMenuId === task.id ? taskMenuRef : null} className="relative" onDragStart={(event) => event.stopPropagation()}>
                              <button type="button" draggable={false} aria-label="Opções da tarefa" aria-haspopup="menu" aria-expanded={openTaskMenuId === task.id} aria-controls={`task-menu-${task.id}`} title="Opções da tarefa" onClick={() => setOpenTaskMenuId((current) => current === task.id ? null : task.id)} className="grid size-7 place-items-center rounded-lg text-lg leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600">⋮</button>
                              {openTaskMenuId === task.id && (
                                <div id={`task-menu-${task.id}`} role="menu" aria-label={`Opções da tarefa ${task.title}`} className="absolute right-0 top-full z-30 mt-1 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                                  <button type="button" role="menuitem" onClick={() => { setOpenTaskMenuId(null); setEditor({ kind: "task", column, task }); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50">Editar</button>
                                  {targetColumn && <button type="button" role="menuitem" onClick={() => { setOpenTaskMenuId(null); void moveTaskToColumn(task, column.id, targetColumn); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50">{nextColumnActionLabel(column)}</button>}
                                  <button type="button" role="menuitem" onClick={() => { setOpenTaskMenuId(null); setEditor({ kind: "task", column, task }); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50">{dueDate ? "Editar data limite" : "Definir data limite"}</button>
                                  {dueDate && <button type="button" role="menuitem" onClick={() => void clearTaskDueDate(column, task)} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 focus-visible:bg-slate-50">Remover data limite</button>}
                                </div>
                              )}
                            </div>
                            <button type="button" aria-label="Excluir tarefa" onClick={() => void deleteTask(column, task)} className="grid size-7 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">×</button>
                          </div>
                        </div>
                        {task.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-slate-500">{task.description}</p>}
                        {dueDate && <p className={`mt-3 flex items-center gap-1 text-xs ${isOverdue ? "font-semibold text-red-600" : "text-slate-500"}`}><span aria-hidden="true">{isOverdue ? "⚠" : "◷"}</span>{isOverdue ? "Atrasada · " : ""}{formatDate(dueDate)}</p>}
                      </article>
                    );
                  })}
                </div>
                <button onClick={() => setEditor({ kind: "task", column })} className="mt-3 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-500 hover:bg-white/70 hover:text-indigo-700">＋ Adicionar tarefa</button>
              </section>
            ))}
            {columns.length === 0 && <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">Adicione uma coluna para começar seu Kanban.</div>}
          </div>
        )}
        {editor && <Modal title={editor.kind === "column" ? editor.column ? "Editar coluna" : "Nova coluna" : editor.task ? "Editar tarefa" : "Nova tarefa"} close={() => setEditor(null)}>
          <form onSubmit={save} className="space-y-4">
            {editor.kind === "column" ? <label className="field-label">Nome da coluna<input required autoFocus name="name" defaultValue={editor.column?.name ?? ""} maxLength={60} className="field-input" /></label> : <>
              <label className="field-label">Título<input required autoFocus name="title" defaultValue={editor.task?.title ?? ""} maxLength={120} className="field-input" /></label>
              <label className="field-label">Descrição <span className="font-normal text-slate-400">(opcional)</span><textarea name="description" rows={4} defaultValue={editor.task?.description ?? ""} className="field-input resize-y" /></label>
              <label className="field-label">Data limite <span className="font-normal text-slate-400">(opcional)</span><input type="date" name="dueDate" defaultValue={editor.task?.dueDate?.slice(0, 10) ?? ""} className="field-input" /></label>
            </>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditor(null)} className="secondary-button">Cancelar</button><button disabled={saving} className="primary-button">{saving ? "Salvando…" : "Salvar"}</button></div>
          </form>
        </Modal>}
      </main>
    </AuthGuard>
  );
}
