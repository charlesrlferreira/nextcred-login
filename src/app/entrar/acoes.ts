"use server";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { and, desc, eq, gt, lt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { enviarCodigo } from "@/lib/auth/email";
import { criarSessao, encerrarSessao } from "@/lib/auth/sessao";
import { codigosLogin, db, escritorios, usuarios } from "@/lib/db";

const VALIDADE_MIN = 10;
const MAX_TENTATIVAS = 5;
const MAX_CODIGOS_HORA = 5;

export type EstadoEntrar = { etapa: "email" | "codigo"; email?: string; erro?: string };

const emailSchema = z.email("Informe um e-mail válido.").max(254);

function hashCodigo(email: string, codigo: string) {
  return createHash("sha256").update(`${email}:${codigo}:${process.env.SESSION_SECRET}`).digest("hex");
}

export async function pedirCodigo(_: EstadoEntrar, form: FormData): Promise<EstadoEntrar> {
  const analise = emailSchema.safeParse(String(form.get("email") ?? "").trim().toLowerCase());
  if (!analise.success) return { etapa: "email", erro: analise.error.issues[0].message };
  const email = analise.data;

  const umaHoraAtras = new Date(Date.now() - 3600_000);
  const recentes = await db
    .select({ id: codigosLogin.id })
    .from(codigosLogin)
    .where(and(eq(codigosLogin.email, email), gt(codigosLogin.criadoEm, umaHoraAtras)));
  if (recentes.length >= MAX_CODIGOS_HORA)
    return { etapa: "email", email, erro: "Muitos códigos pedidos. Aguarde alguns minutos e tente de novo." };

  const codigo = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.delete(codigosLogin).where(lt(codigosLogin.expiraEm, new Date()));
  await db.insert(codigosLogin).values({
    email,
    codigoHash: hashCodigo(email, codigo),
    expiraEm: new Date(Date.now() + VALIDADE_MIN * 60_000),
  });

  try {
    await enviarCodigo(email, codigo);
  } catch (e) {
    console.error(e);
    return { etapa: "email", email, erro: "Não foi possível enviar o e-mail agora. Tente novamente." };
  }
  return { etapa: "codigo", email };
}

export async function confirmarCodigo(_: EstadoEntrar, form: FormData): Promise<EstadoEntrar> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const codigo = String(form.get("codigo") ?? "").replace(/\D/g, "");
  if (codigo.length !== 6) return { etapa: "codigo", email, erro: "O código tem 6 dígitos." };

  const [registro] = await db
    .select()
    .from(codigosLogin)
    .where(and(eq(codigosLogin.email, email), gt(codigosLogin.expiraEm, new Date())))
    .orderBy(desc(codigosLogin.criadoEm))
    .limit(1);
  if (!registro) return { etapa: "codigo", email, erro: "Código expirado. Peça um novo código." };
  if (registro.tentativas >= MAX_TENTATIVAS)
    return { etapa: "codigo", email, erro: "Tentativas esgotadas. Peça um novo código." };

  const esperado = Buffer.from(registro.codigoHash, "hex");
  const recebido = Buffer.from(hashCodigo(email, codigo), "hex");
  if (!timingSafeEqual(esperado, recebido)) {
    await db.update(codigosLogin).set({ tentativas: registro.tentativas + 1 }).where(eq(codigosLogin.id, registro.id));
    return { etapa: "codigo", email, erro: "Código incorreto." };
  }

  await db.delete(codigosLogin).where(eq(codigosLogin.email, email));

  let [usuario] = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);
  const novo = !usuario;
  if (!usuario) {
    usuario = await db.transaction(async (tx) => {
      const [esc] = await tx.insert(escritorios).values({ nome: "Meu escritório", email }).returning();
      const [u] = await tx.insert(usuarios).values({ email, escritorioId: esc.id }).returning();
      return u;
    });
  }
  await db.update(usuarios).set({ ultimoAcesso: new Date() }).where(eq(usuarios.id, usuario.id));
  await criarSessao(usuario.id);
  redirect(novo ? "/app/escritorio?bemvindo=1" : "/app");
}

export async function sair() {
  await encerrarSessao();
  redirect("/");
}
