"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirUsuario } from "@/lib/auth/dal";
import { clientes, db } from "@/lib/db";

export type EstadoCliente = { erro?: string; ok?: boolean };

const schema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do cliente.").max(160),
  documento: z.string().trim().max(20).optional(),
  email: z.union([z.literal(""), z.email("E-mail inválido.")]).optional(),
  regime: z.string().max(40).optional(),
});

export async function criarCliente(_: EstadoCliente, form: FormData): Promise<EstadoCliente> {
  const { escritorio } = await exigirUsuario();
  const dados = schema.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  await db.insert(clientes).values({
    escritorioId: escritorio.id,
    nome: dados.data.nome,
    documento: dados.data.documento || null,
    email: dados.data.email || null,
    regime: dados.data.regime || null,
  });
  revalidatePath("/app/clientes");
  return { ok: true };
}

export async function excluirCliente(id: string) {
  const { escritorio } = await exigirUsuario();
  await db.delete(clientes).where(and(eq(clientes.id, id), eq(clientes.escritorioId, escritorio.id)));
  revalidatePath("/app/clientes");
}
