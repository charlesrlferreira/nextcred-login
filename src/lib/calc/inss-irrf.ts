import {
  INSS_FAIXAS,
  INSS_TETO,
  IRRF_DEDUCAO_DEPENDENTE,
  IRRF_DESCONTO_SIMPLIFICADO,
  IRRF_FAIXAS,
  REDUTOR_IR,
} from "./tabelas";
import { brl, pct, r2 } from "./util";
import type { BaseLegal, Resultado } from "./tipos";

export type LinhaInss = { faixa: string; base: number; aliquota: number; valor: number };

/** INSS progressivo do empregado, faixa a faixa. */
export function calcularInss(remuneracao: number): { total: number; linhas: LinhaInss[] } {
  const linhas: LinhaInss[] = [];
  let anterior = 0;
  let total = 0;
  for (const f of INSS_FAIXAS) {
    if (remuneracao <= anterior) break;
    const base = Math.min(remuneracao, f.ate) - anterior;
    const valor = base * f.aliquota;
    linhas.push({ faixa: `${brl(anterior === 0 ? 0 : anterior + 0.01)} a ${brl(f.ate)}`, base: r2(base), aliquota: f.aliquota, valor: r2(valor) });
    total += valor;
    anterior = f.ate;
  }
  return { total: r2(total), linhas };
}

export type DeducoesIr = { dependentes?: number; pensao?: number; previdenciaPrivada?: number };

export type DetalheIrrf = {
  rendimento: number;
  inss: number;
  deducoesLegais: number;
  usouSimplificado: boolean;
  deducaoAplicada: number;
  base: number;
  aliquota: number;
  parcelaDeduzir: number;
  impostoTabela: number;
  redutor: number;
  imposto: number;
};

/** Redutor mensal da Lei 15.270/2025, limitado ao imposto calculado pela tabela. */
export function redutorIr(rendimento: number, impostoTabela: number): number {
  let reducao = 0;
  if (rendimento <= REDUTOR_IR.isencaoAte) reducao = REDUTOR_IR.reducaoMaxima;
  else if (rendimento <= REDUTOR_IR.faixaGradualAte) reducao = REDUTOR_IR.constante - REDUTOR_IR.fator * rendimento;
  return r2(Math.max(0, Math.min(reducao, impostoTabela)));
}

/**
 * IRRF mensal: compara as deduções legais (INSS, dependentes, pensão, previdência)
 * com o desconto simplificado e usa a mais vantajosa; depois aplica o redutor.
 */
export function calcularIrrf(rendimento: number, inss: number, ded: DeducoesIr = {}): DetalheIrrf {
  const deducoesLegais = r2(
    inss + (ded.dependentes ?? 0) * IRRF_DEDUCAO_DEPENDENTE + (ded.pensao ?? 0) + (ded.previdenciaPrivada ?? 0),
  );
  const usouSimplificado = IRRF_DESCONTO_SIMPLIFICADO > deducoesLegais;
  const deducaoAplicada = usouSimplificado ? IRRF_DESCONTO_SIMPLIFICADO : deducoesLegais;
  const base = r2(Math.max(0, rendimento - deducaoAplicada));
  const faixa = IRRF_FAIXAS.find((f) => base <= f.ate)!;
  const impostoTabela = r2(Math.max(0, base * faixa.aliquota - faixa.deducao));
  const redutor = redutorIr(rendimento, impostoTabela);
  return {
    rendimento: r2(rendimento),
    inss,
    deducoesLegais,
    usouSimplificado,
    deducaoAplicada,
    base,
    aliquota: faixa.aliquota,
    parcelaDeduzir: faixa.deducao,
    impostoTabela,
    redutor,
    imposto: r2(impostoTabela - redutor),
  };
}

export function memoriaIrrf(rotulo: string, d: DetalheIrrf): string[] {
  return [
    `${rotulo}: rendimento tributável ${brl(d.rendimento)}.`,
    d.usouSimplificado
      ? `Desconto simplificado de ${brl(d.deducaoAplicada)} (maior que as deduções legais de ${brl(d.deducoesLegais)}).`
      : `Deduções legais de ${brl(d.deducoesLegais)} (INSS, dependentes e demais), maiores que o desconto simplificado.`,
    `Base de cálculo: ${brl(d.base)} → alíquota ${pct(d.aliquota * 100)}, parcela a deduzir ${brl(d.parcelaDeduzir)} → imposto pela tabela ${brl(d.impostoTabela)}.`,
    d.redutor > 0
      ? `Redutor da Lei 15.270/2025: −${brl(d.redutor)} → IRRF de ${brl(d.imposto)}.`
      : `Sem redutor aplicável (rendimento acima de ${brl(REDUTOR_IR.faixaGradualAte)} ou imposto zerado) → IRRF de ${brl(d.imposto)}.`,
  ];
}

export const BASE_LEGAL_INSS: BaseLegal = {
  norma: "Lei 8.212/1991, art. 20 e art. 28; EC 103/2019, art. 28",
  descricao: "Contribuição do segurado empregado com alíquotas progressivas por faixa, limitada ao teto do RGPS (valores atualizados por portaria interministerial anual).",
};

export const BASE_LEGAL_IRRF: BaseLegal[] = [
  { norma: "Lei 7.713/1988 e Lei 9.250/1995, art. 4º", descricao: "Tabela progressiva mensal e deduções (dependentes, pensão alimentícia, previdência)." },
  { norma: "Lei 14.663/2023", descricao: "Desconto simplificado mensal em substituição às deduções legais." },
  { norma: "Lei 15.270/2025", descricao: "Redução do imposto mensal: isenção efetiva até R$ 5.000,00 e redução decrescente até R$ 7.350,00." },
];

/* ---------- Ferramenta: Calculadora de INSS e IRRF ---------- */

export type EntradaInssIrrf = {
  salario: number;
  dependentes: number;
  pensao: number;
  previdenciaPrivada: number;
};

export function ferramentaInssIrrf(e: EntradaInssIrrf): Resultado {
  const inss = calcularInss(e.salario);
  const ir = calcularIrrf(e.salario, inss.total, e);
  const liquido = r2(e.salario - inss.total - ir.imposto - e.pensao);
  const alertas: string[] = [];
  if (e.salario > INSS_TETO) alertas.push(`Remuneração acima do teto do INSS (${brl(INSS_TETO)}): a contribuição fica limitada ao teto.`);

  return {
    destaques: [
      { rotulo: "Salário líquido", valor: liquido, formato: "moeda", principal: true },
      { rotulo: "INSS", valor: inss.total, formato: "moeda", tom: "negativo" },
      { rotulo: "IRRF", valor: ir.imposto, formato: "moeda", tom: "negativo" },
      { rotulo: "Alíquota efetiva total", valor: e.salario ? r2(((inss.total + ir.imposto) / e.salario) * 100) : 0, formato: "percentual" },
    ],
    tabelas: [
      {
        titulo: "INSS por faixa",
        colunas: ["Faixa", "Base na faixa", "Alíquota", "Contribuição"],
        linhas: inss.linhas.map((l) => [l.faixa, brl(l.base), pct(l.aliquota * 100), brl(l.valor)]),
        total: ["Total", "", "", brl(inss.total)],
      },
      {
        titulo: "Demonstrativo",
        colunas: ["Descrição", "Valor"],
        linhas: [
          ["Salário bruto", brl(e.salario)],
          ["(−) INSS", brl(inss.total)],
          ["(−) IRRF", brl(ir.imposto)],
          ...(e.pensao ? [["(−) Pensão alimentícia", brl(e.pensao)]] : []),
        ],
        total: ["Líquido", brl(liquido)],
      },
    ],
    memoria: [
      `INSS progressivo: soma das contribuições de cada faixa até ${brl(Math.min(e.salario, INSS_TETO))} = ${brl(inss.total)}.`,
      ...memoriaIrrf("IRRF", ir),
    ],
    alertas,
    baseLegal: [BASE_LEGAL_INSS, ...BASE_LEGAL_IRRF],
  };
}
