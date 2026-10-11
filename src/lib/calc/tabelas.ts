/**
 * Tabelas legais vigentes. Toda alteração de alíquota, faixa ou teto é feita
 * apenas aqui, e todas as ferramentas passam a usar o novo valor.
 *
 * Vigência: 2026. Revisar sempre que sair portaria/lei nova.
 */

export const VIGENCIA = "2026";

export const SALARIO_MINIMO = 1621.0;

/* ---------- INSS do empregado (progressivo por faixa) ---------- */

export type FaixaInss = { ate: number; aliquota: number };

export const INSS_FAIXAS: FaixaInss[] = [
  { ate: 1621.0, aliquota: 0.075 },
  { ate: 2902.84, aliquota: 0.09 },
  { ate: 4354.27, aliquota: 0.12 },
  { ate: 8475.55, aliquota: 0.14 },
];

export const INSS_TETO = INSS_FAIXAS[INSS_FAIXAS.length - 1].ate;

/** Contribuinte individual (sócio sobre pró-labore): 11% até o teto. */
export const INSS_CONTRIBUINTE_INDIVIDUAL = 0.11;

/** Contribuição patronal (CPP) sobre folha e pró-labore fora do Simples. */
export const CPP_PATRONAL = 0.2;

/* ---------- IRRF mensal ---------- */

export type FaixaIrrf = { ate: number; aliquota: number; deducao: number };

export const IRRF_FAIXAS: FaixaIrrf[] = [
  { ate: 2428.8, aliquota: 0, deducao: 0 },
  { ate: 2826.65, aliquota: 0.075, deducao: 182.16 },
  { ate: 3751.05, aliquota: 0.15, deducao: 394.16 },
  { ate: 4664.68, aliquota: 0.225, deducao: 675.49 },
  { ate: Infinity, aliquota: 0.275, deducao: 908.73 },
];

export const IRRF_DEDUCAO_DEPENDENTE = 189.59;
/** Desconto simplificado mensal: substitui todas as deduções legais quando for maior. */
export const IRRF_DESCONTO_SIMPLIFICADO = 607.2;

/** Redutor mensal da Lei 15.270/2025 (isenção até R$ 5.000 e redução gradual até R$ 7.350). */
export const REDUTOR_IR = {
  isencaoAte: 5000.0,
  reducaoMaxima: 312.89,
  faixaGradualAte: 7350.0,
  constante: 978.62,
  fator: 0.133145,
};

/** Retenção de 10% sobre lucros e dividendos acima de R$ 50 mil/mês (Lei 15.270/2025). */
export const DIVIDENDOS = { limiteMensalIsento: 50000, aliquotaRetencao: 0.1 };

/* ---------- Simples Nacional (LC 123/2006, Anexos I a V) ---------- */

export type Anexo = "I" | "II" | "III" | "IV" | "V";

export type FaixaSimples = { ate: number; aliquota: number; deducao: number };

const LIMITES = [180000, 360000, 720000, 1800000, 3600000, 4800000];

function faixas(aliquotas: number[], deducoes: number[]): FaixaSimples[] {
  return LIMITES.map((ate, i) => ({ ate, aliquota: aliquotas[i], deducao: deducoes[i] }));
}

export const SIMPLES: Record<Anexo, { nome: string; faixas: FaixaSimples[] }> = {
  I: {
    nome: "Anexo I — Comércio",
    faixas: faixas([0.04, 0.073, 0.095, 0.107, 0.143, 0.19], [0, 5940, 13860, 22500, 87300, 378000]),
  },
  II: {
    nome: "Anexo II — Indústria",
    faixas: faixas([0.045, 0.078, 0.1, 0.112, 0.147, 0.3], [0, 5940, 13860, 22500, 85500, 720000]),
  },
  III: {
    nome: "Anexo III — Serviços",
    faixas: faixas([0.06, 0.112, 0.135, 0.16, 0.21, 0.33], [0, 9360, 17640, 35640, 125640, 648000]),
  },
  IV: {
    nome: "Anexo IV — Serviços (CPP fora do DAS)",
    faixas: faixas([0.045, 0.09, 0.102, 0.14, 0.22, 0.33], [0, 8100, 12420, 39780, 183780, 828000]),
  },
  V: {
    nome: "Anexo V — Serviços",
    faixas: faixas([0.155, 0.18, 0.195, 0.205, 0.23, 0.305], [0, 4500, 9900, 17100, 62100, 540000]),
  },
};

export const SIMPLES_SUBLIMITE = 3600000;
export const SIMPLES_LIMITE = 4800000;
export const FATOR_R_MINIMO = 0.28;

/* ---------- Lucro Presumido e Lucro Real ---------- */

export const PRESUMIDO = {
  presuncaoIrpj: { comercio: 0.08, servicos: 0.32 },
  presuncaoCsll: { comercio: 0.12, servicos: 0.32 },
  irpj: 0.15,
  adicionalIrpj: 0.1,
  /** Limite anual sem adicional (R$ 20 mil/mês). */
  limiteAdicionalAnual: 240000,
  csll: 0.09,
  pis: 0.0065,
  cofins: 0.03,
  /** LC 224/2025: presunção acrescida de 10% sobre a receita que exceder R$ 5 milhões no ano. */
  acrescimoReceitaAcima: 5000000,
  acrescimoPresuncao: 0.1,
  limiteOpcao: 78000000,
};

export const REAL = { pis: 0.0165, cofins: 0.076 };

/* ---------- Débitos federais em atraso (Lei 9.430/1996, art. 61) ---------- */

export const MULTA_MORA = { porDia: 0.0033, limite: 0.2 };

/* ---------- Férias (CLT, art. 130) ---------- */

export function diasFeriasPorFaltas(faltas: number): number {
  if (faltas <= 5) return 30;
  if (faltas <= 14) return 24;
  if (faltas <= 23) return 18;
  if (faltas <= 32) return 12;
  return 0;
}
