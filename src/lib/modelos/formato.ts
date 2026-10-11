import { brl, fmtData } from "../calc/util";
import { reaisPorExtenso } from "../extenso";
import type { DadosEscritorio } from "./tipos";

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;
const LACUNA = "________";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** "2026-10-11" → "11 de outubro de 2026". */
export function dataExtenso(iso: string): string {
  if (!DATA_ISO.test(iso)) return "____ de __________ de ______";
  const [a, m, d] = iso.split("-").map(Number);
  return `${d === 1 ? "1º" : d} de ${MESES[m - 1]} de ${a}`;
}

/** R$ 1.850,00 (mil oitocentos e cinquenta reais). */
export function moedaExtenso(valor: unknown): string {
  const n = Number(valor);
  if (valor === undefined || valor === null || valor === "" || !Number.isFinite(n)) return `R$ ${LACUNA}`;
  return `${brl(n)} (${reaisPorExtenso(n)})`;
}

export const data = (v: unknown) => (DATA_ISO.test(String(v)) ? fmtData(String(v)) : "___/___/______");
export const txt = (v: unknown, padrao = LACUNA) => (v === undefined || v === null || v === "" ? padrao : String(v));

/** Qualificação do escritório para o texto: nome, CNPJ, CRC e endereço quando informados. */
export function qualificacaoEscritorio(e: DadosEscritorio): string {
  const partes = [e.nome];
  if (e.cnpj) partes.push(`inscrito no CNPJ sob o nº ${e.cnpj}`);
  if (e.crc) partes.push(`registro no CRC nº ${e.crc}`);
  if (e.endereco) partes.push(`com sede em ${e.endereco}`);
  return partes.join(", ");
}

/** "São Paulo/SP, 11 de outubro de 2026". */
export function localData(cidade: unknown, dataIso: unknown): string {
  const hoje = new Date().toISOString().slice(0, 10);
  return `${txt(cidade)}, ${dataExtenso(txt(dataIso, hoje))}.`;
}

/** Texto plano do documento, usado para copiar e para buscas. */
export function paragrafos(texto: string): string[] {
  return texto
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** 4.62 → "4,62%". */
export const percentual = (v: unknown) =>
  Number.isFinite(Number(v)) && v !== "" && v !== undefined ? `${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%` : `${LACUNA}%`;
