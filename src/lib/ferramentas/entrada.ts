import type { Campo } from "../campos";

/** Converte "1.234,56", "R$ 1234,56" ou "1234.56" em número. */
export function parseNumeroBr(texto: string): number | null {
  let s = texto.replace(/R\$|%|\s/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (!/^-?\d+\.\d{1,2}$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function campoVisivel(campo: Campo, valores: Record<string, unknown>): boolean {
  if (!campo.mostrarSe) return true;
  return campo.mostrarSe.valores.includes(String(valores[campo.mostrarSe.campo] ?? ""));
}

export type ResultadoValidacao =
  | { ok: true; valores: Record<string, unknown> }
  | { ok: false; erros: Record<string, string> };

/** Valida e converte os dados do formulário de acordo com os campos declarados. */
export function validarEntrada(ferramenta: { campos: Campo[] }, bruto: Record<string, string>): ResultadoValidacao {
  const valores: Record<string, unknown> = {};
  const erros: Record<string, string> = {};

  // Seleções primeiro, para resolver campos condicionais.
  for (const c of ferramenta.campos.filter((c) => c.tipo === "selecao")) {
    const v = bruto[c.nome] ?? String(c.padrao ?? "");
    if (!c.opcoes?.some((o) => o.valor === v)) erros[c.nome] = "Escolha uma opção.";
    else valores[c.nome] = v;
  }

  for (const c of ferramenta.campos) {
    if (c.tipo === "selecao") continue;
    const visivel = campoVisivel(c, valores);
    const texto = (bruto[c.nome] ?? "").trim();

    if (c.tipo === "sim_nao") {
      valores[c.nome] = visivel ? texto === "on" || texto === "true" : Boolean(c.padrao);
      continue;
    }

    if (!visivel) {
      valores[c.nome] = c.padrao;
      continue;
    }
    if (!texto) {
      if (c.padrao !== undefined) valores[c.nome] = c.padrao;
      else if (!c.opcional) erros[c.nome] = "Campo obrigatório.";
      continue;
    }

    if (c.tipo === "texto" || c.tipo === "texto_longo") {
      const limite = c.max ?? (c.tipo === "texto" ? 300 : 5000);
      if (texto.length > limite) erros[c.nome] = `Use no máximo ${limite} caracteres.`;
      else valores[c.nome] = texto;
      continue;
    }

    if (c.tipo === "data") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(texto) || Number.isNaN(Date.parse(texto))) erros[c.nome] = "Data inválida.";
      else valores[c.nome] = texto;
      continue;
    }

    const n = parseNumeroBr(texto);
    if (n === null) {
      erros[c.nome] = "Número inválido.";
      continue;
    }
    if (c.tipo === "inteiro" && !Number.isInteger(n)) {
      erros[c.nome] = "Informe um número inteiro.";
      continue;
    }
    const min = c.min ?? 0;
    if (n < min) {
      erros[c.nome] = `O valor mínimo é ${min}.`;
      continue;
    }
    if (c.max !== undefined && n > c.max) {
      erros[c.nome] = `O valor máximo é ${c.max}.`;
      continue;
    }
    if (c.tipo === "percentual" && n >= 1000) {
      erros[c.nome] = "Percentual inválido.";
      continue;
    }
    valores[c.nome] = n;
  }

  return Object.keys(erros).length ? { ok: false, erros } : { ok: true, valores };
}
