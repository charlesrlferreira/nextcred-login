"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { buscarChecklist } from "@/lib/checklists/catalogo";
import { buscarCliente, buscarChecklistCliente } from "@/lib/dados";
import { checklists, db } from "@/lib/db";

export async function criarChecklist(slug: string, form: FormData) {
  const { usuario, escritorio } = await exigirUsuario();
  const modelo = buscarChecklist(slug);
  if (!modelo) redirect("/app/checklists");
  const clienteIdBruto = String(form.get("clienteId") ?? "");
  const cliente = clienteIdBruto ? await buscarCliente(escritorio.id, clienteIdBruto) : null;
  const tituloInformado = String(form.get("titulo") ?? "").trim().slice(0, 160);

  const [novo] = await db
    .insert(checklists)
    .values({
      escritorioId: escritorio.id,
      usuarioId: usuario.id,
      clienteId: cliente?.id ?? null,
      modelo: slug,
      titulo: tituloInformado || (cliente ? `${modelo.titulo} — ${cliente.nome}` : modelo.titulo),
    })
    .returning({ id: checklists.id });
  redirect(`/app/checklists/${novo.id}`);
}

/** Marca ou desmarca um passo. Retorna a lista atualizada de passos concluídos. */
export async function marcarPasso(id: string, indice: number, feito: boolean): Promise<number[]> {
  const { escritorio } = await exigirUsuario();
  const linha = await buscarChecklistCliente(escritorio.id, id);
  if (!linha) throw new Error("Checklist não encontrado.");
  const total = buscarChecklist(linha.checklist.modelo)?.passos.length ?? 0;
  if (!Number.isInteger(indice) || indice < 0 || indice >= total) throw new Error("Passo inválido.");

  const atual = new Set(linha.checklist.concluidos);
  if (feito) atual.add(indice);
  else atual.delete(indice);
  const concluidos = [...atual].sort((a, b) => a - b);
  await db
    .update(checklists)
    .set({ concluidos, atualizadoEm: new Date() })
    .where(and(eq(checklists.id, id), eq(checklists.escritorioId, escritorio.id)));
  revalidatePath("/app/checklists");
  return concluidos;
}

export async function salvarObservacoes(id: string, texto: string) {
  const { escritorio } = await exigirUsuario();
  await db
    .update(checklists)
    .set({ observacoes: texto.slice(0, 5000) || null, atualizadoEm: new Date() })
    .where(and(eq(checklists.id, id), eq(checklists.escritorioId, escritorio.id)));
}

export async function excluirChecklist(id: string) {
  const { escritorio } = await exigirUsuario();
  await db.delete(checklists).where(and(eq(checklists.id, id), eq(checklists.escritorioId, escritorio.id)));
  revalidatePath("/app/checklists");
  redirect("/app/checklists");
}
