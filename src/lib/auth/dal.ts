import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, escritorios, usuarios } from "@/lib/db";
import { lerSessao } from "./sessao";

/** Usuário e escritório da sessão atual; redireciona para /entrar se não houver. */
export const exigirUsuario = cache(async () => {
  const id = await lerSessao();
  if (!id) redirect("/entrar");
  const [linha] = await db
    .select({ usuario: usuarios, escritorio: escritorios })
    .from(usuarios)
    .innerJoin(escritorios, eq(usuarios.escritorioId, escritorios.id))
    .where(eq(usuarios.id, id))
    .limit(1);
  if (!linha) redirect("/entrar");
  return linha;
});
