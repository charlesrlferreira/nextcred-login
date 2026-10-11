"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { buscarCliente } from "@/lib/dados";
import { db, documentos } from "@/lib/db";
import { validarEntrada } from "@/lib/ferramentas/entrada";
import { buscarModelo } from "@/lib/modelos/catalogo";

export type EstadoDocumento = { erros?: Record<string, string>; erroGeral?: string };

export async function salvarDocumento(slug: string, _: EstadoDocumento, form: FormData): Promise<EstadoDocumento> {
  const { usuario, escritorio } = await exigirUsuario();
  const modelo = buscarModelo(slug);
  if (!modelo) return { erroGeral: "Modelo não encontrado." };

  const bruto: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") bruto[k] = v;
  const validacao = validarEntrada(modelo, bruto);
  if (!validacao.ok) return { erros: validacao.erros, erroGeral: "Confira os campos destacados." };

  // Sem data informada, fixa a de hoje para o documento não mudar a cada reimpressão.
  if (modelo.campos.some((c) => c.nome === "dataDocumento") && !validacao.valores.dataDocumento)
    validacao.valores.dataDocumento = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });

  const cliente = bruto.clienteId ? await buscarCliente(escritorio.id, bruto.clienteId) : null;
  const [novo] = await db
    .insert(documentos)
    .values({
      escritorioId: escritorio.id,
      usuarioId: usuario.id,
      clienteId: cliente?.id ?? null,
      modelo: slug,
      titulo: modelo.titulo(validacao.valores).slice(0, 200),
      campos: validacao.valores,
    })
    .returning({ id: documentos.id });
  revalidatePath("/app/modelos");
  redirect(`/app/documentos/${novo.id}`);
}

export async function excluirDocumento(id: string) {
  const { escritorio } = await exigirUsuario();
  await db.delete(documentos).where(and(eq(documentos.id, id), eq(documentos.escritorioId, escritorio.id)));
  revalidatePath("/app/modelos");
  redirect("/app/modelos");
}
