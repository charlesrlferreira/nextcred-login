"use server";

import { exigirUsuario } from "@/lib/auth/dal";
import type { Resultado } from "@/lib/calc/tipos";
import { buscarCliente } from "@/lib/dados";
import { calculos, db } from "@/lib/db";
import { validarEntrada } from "@/lib/ferramentas/entrada";
import { buscarFerramenta } from "@/lib/ferramentas/registro";

export type EstadoCalculo = {
  erros?: Record<string, string>;
  erroGeral?: string;
  id?: string;
  resultado?: Resultado;
};

export async function calcular(slug: string, _: EstadoCalculo, form: FormData): Promise<EstadoCalculo> {
  const { usuario, escritorio } = await exigirUsuario();
  const ferramenta = buscarFerramenta(slug);
  if (!ferramenta) return { erroGeral: "Ferramenta não encontrada." };

  const bruto: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") bruto[k] = v;

  const validacao = validarEntrada(ferramenta, bruto);
  if (!validacao.ok) return { erros: validacao.erros, erroGeral: "Confira os campos destacados." };

  let resultado: Resultado;
  try {
    resultado = ferramenta.calcular(validacao.valores);
  } catch (e) {
    return { erroGeral: e instanceof Error ? e.message : "Não foi possível calcular com esses dados." };
  }

  const clienteId = bruto.clienteId ? (await buscarCliente(escritorio.id, bruto.clienteId))?.id ?? null : null;
  const tituloInformado = bruto.titulo?.trim().slice(0, 160);

  const [salvo] = await db
    .insert(calculos)
    .values({
      escritorioId: escritorio.id,
      usuarioId: usuario.id,
      clienteId,
      ferramenta: slug,
      titulo: tituloInformado || ferramenta.titulo(validacao.valores),
      entrada: validacao.valores,
      resultado,
    })
    .returning({ id: calculos.id });

  return { id: salvo.id, resultado };
}
