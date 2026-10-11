/** Arredonda para centavos (meio para cima), evitando erros de ponto flutuante. */
export function r2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

const moedaFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numeroFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const pctFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const brl = (v: number) => moedaFmt.format(r2(v)).replace(/ /g, " ");
export const num = (v: number) => numeroFmt.format(v);
/** Recebe percentual já multiplicado por 100 (ex.: 7.5 → "7,50%"). */
export const pct = (v: number) => `${pctFmt.format(v)}%`;

/* ---------- Datas (strings AAAA-MM-DD, sempre em UTC) ---------- */

export function parseData(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

export function isoData(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export function fmtData(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

export function somaDias(data: Date, dias: number): Date {
  return new Date(data.getTime() + dias * 86_400_000);
}

export function diffDias(inicio: Date, fim: Date): number {
  return Math.round((fim.getTime() - inicio.getTime()) / 86_400_000);
}

/** Último dia do mês (1–31) para ano/mês (0–11) em UTC. */
export function diasNoMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
}

/** Mesma data N meses depois; ajusta para o último dia quando o mês é mais curto. */
export function somaMeses(data: Date, meses: number): Date {
  const ano = data.getUTCFullYear();
  const mes = data.getUTCMonth() + meses;
  const alvoAno = ano + Math.floor(mes / 12);
  const alvoMes = ((mes % 12) + 12) % 12;
  const dia = Math.min(data.getUTCDate(), diasNoMes(alvoAno, alvoMes));
  return new Date(Date.UTC(alvoAno, alvoMes, dia));
}

/** Anos completos entre duas datas. */
export function anosCompletos(inicio: Date, fim: Date): number {
  let anos = fim.getUTCFullYear() - inicio.getUTCFullYear();
  if (somaMeses(inicio, anos * 12) > fim) anos--;
  return Math.max(0, anos);
}
