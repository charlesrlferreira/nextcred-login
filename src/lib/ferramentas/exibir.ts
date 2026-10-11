import type { Formato } from "../calc/tipos";
import { brl, fmtData, num, pct } from "../calc/util";
import { campoVisivel } from "./entrada";
import type { Ferramenta } from "./registro";

export function formatarValor(valor: number | string, formato: Formato): string {
  if (typeof valor === "string") return formato === "data" ? fmtData(valor) : valor;
  switch (formato) {
    case "moeda":
      return brl(valor);
    case "percentual":
      return pct(valor);
    default:
      return num(valor);
  }
}

/** Lista "rótulo: valor" dos dados informados, para o PDF e o histórico. */
export function resumoEntrada(ferramenta: Ferramenta, entrada: Record<string, unknown>): [string, string][] {
  return ferramenta.campos
    .filter((c) => campoVisivel(c, entrada) && entrada[c.nome] !== undefined && entrada[c.nome] !== null)
    .map((c) => {
      const v = entrada[c.nome];
      let texto: string;
      if (c.tipo === "selecao") texto = c.opcoes?.find((o) => o.valor === v)?.rotulo ?? String(v);
      else if (c.tipo === "sim_nao") texto = v ? "Sim" : "Não";
      else if (c.tipo === "data") texto = fmtData(String(v));
      else if (c.tipo === "moeda") texto = brl(Number(v));
      else if (c.tipo === "percentual") texto = pct(Number(v));
      else texto = num(Number(v));
      return [c.rotulo, texto];
    });
}

/** Valores para preencher o formulário ao duplicar um cálculo. */
export function valoresParaFormulario(ferramenta: Ferramenta, entrada: Record<string, unknown>): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const c of ferramenta.campos) {
    const v = entrada[c.nome];
    if (v === undefined || v === null) continue;
    if (c.tipo === "sim_nao") saida[c.nome] = v ? "true" : "";
    else if (typeof v === "number") saida[c.nome] = v.toLocaleString("pt-BR", { maximumFractionDigits: 2, useGrouping: false });
    else saida[c.nome] = String(v);
  }
  return saida;
}
