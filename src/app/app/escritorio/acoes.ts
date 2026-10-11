"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirUsuario } from "@/lib/auth/dal";
import { db, escritorios } from "@/lib/db";

export type EstadoEscritorio = { erro?: string; ok?: boolean };

const LOGO_MAX = 400_000;

const opcional = (max: number) => z.string().trim().max(max).optional().transform((v) => v || null);

const schema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do escritório.").max(160),
  cnpj: opcional(20),
  crc: opcional(30),
  responsavel: opcional(120),
  telefone: opcional(30),
  email: opcional(254),
  endereco: opcional(240),
  logo: z.string().optional(),
  removerLogo: z.string().optional(),
});

export async function salvarEscritorio(_: EstadoEscritorio, form: FormData): Promise<EstadoEscritorio> {
  const { escritorio } = await exigirUsuario();
  const dados = schema.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const { logo, removerLogo, ...campos } = dados.data;

  let novoLogo: string | null | undefined;
  if (removerLogo === "1") novoLogo = null;
  else if (logo) {
    if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(logo)) return { erro: "Formato de logo inválido. Use PNG, JPG ou WebP." };
    if (logo.length > LOGO_MAX) return { erro: "Logo muito grande. Use uma imagem menor." };
    novoLogo = logo;
  }

  await db
    .update(escritorios)
    .set({ ...campos, ...(novoLogo !== undefined ? { logo: novoLogo } : {}) })
    .where(eq(escritorios.id, escritorio.id));
  revalidatePath("/app", "layout");
  return { ok: true };
}
