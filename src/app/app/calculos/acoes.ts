"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { calculos, db } from "@/lib/db";

export async function excluirCalculo(id: string) {
  const { escritorio } = await exigirUsuario();
  await db.delete(calculos).where(and(eq(calculos.id, id), eq(calculos.escritorioId, escritorio.id)));
  revalidatePath("/app/calculos");
  redirect("/app/calculos");
}
