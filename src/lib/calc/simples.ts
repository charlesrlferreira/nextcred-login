import { FATOR_R_MINIMO, SIMPLES, SIMPLES_LIMITE, SIMPLES_SUBLIMITE, type Anexo } from "./tabelas";
import type { BaseLegal, Resultado } from "./tipos";
import { brl, pct, r2 } from "./util";

export type AliquotaSimples = {
  anexo: Anexo;
  faixa: number;
  nominal: number;
  deducao: number;
  efetiva: number;
};

/** Alíquota efetiva = (RBT12 × alíquota nominal − parcela a deduzir) ÷ RBT12. */
export function aliquotaEfetiva(anexo: Anexo, rbt12: number): AliquotaSimples {
  const faixas = SIMPLES[anexo].faixas;
  const encontrada = faixas.findIndex((f) => rbt12 <= f.ate);
  const idx = encontrada === -1 ? faixas.length - 1 : encontrada;
  const f = faixas[idx];
  const efetiva = rbt12 > 0 ? (rbt12 * f.aliquota - f.deducao) / rbt12 : f.aliquota;
  return { anexo, faixa: idx + 1, nominal: f.aliquota, deducao: f.deducao, efetiva: Math.max(0, efetiva) };
}

const BASE_LEGAL_SIMPLES: BaseLegal[] = [
  { norma: "LC 123/2006, art. 18, §§ 1º a 1º-B", descricao: "Cálculo da alíquota efetiva a partir da receita bruta dos 12 meses anteriores (RBT12)." },
  { norma: "LC 123/2006, Anexos I a V (redação da LC 155/2016)", descricao: "Faixas de receita, alíquotas nominais e parcelas a deduzir." },
];

function linhasFaixas(anexo: Anexo, faixaAtual: number): string[][] {
  return SIMPLES[anexo].faixas.map((f, i) => [
    `${i + 1}ª faixa${i + 1 === faixaAtual ? " ◄" : ""}`,
    `até ${brl(f.ate)}`,
    pct(f.aliquota * 100),
    brl(f.deducao),
  ]);
}

/* ---------- Calculadora do DAS ---------- */

export type EntradaDas = { anexo: Anexo; rbt12: number; receitaMes: number };

export function calcularDas(e: EntradaDas): Resultado {
  const rbt12 = e.rbt12 > 0 ? e.rbt12 : e.receitaMes * 12;
  const a = aliquotaEfetiva(e.anexo, rbt12);
  const das = r2(e.receitaMes * a.efetiva);
  const alertas: string[] = [];
  if (e.rbt12 <= 0) alertas.push("RBT12 zerado: usada a receita do mês × 12, regra do início de atividade (LC 123/2006, art. 18, § 2º).");
  if (rbt12 > SIMPLES_SUBLIMITE && rbt12 <= SIMPLES_LIMITE)
    alertas.push(`RBT12 acima do sublimite de ${brl(SIMPLES_SUBLIMITE)}: ICMS e ISS passam a ser recolhidos fora do DAS.`);
  if (rbt12 > SIMPLES_LIMITE) alertas.push(`RBT12 acima de ${brl(SIMPLES_LIMITE)}: a empresa deve ser excluída do Simples Nacional.`);
  if (e.anexo === "IV") alertas.push("No Anexo IV, a contribuição patronal (CPP) é recolhida à parte, em GPS/DCTFWeb.");

  return {
    destaques: [
      { rotulo: "Valor do DAS", valor: das, formato: "moeda", principal: true },
      { rotulo: "Alíquota efetiva", valor: r2(a.efetiva * 10000) / 100, formato: "percentual" },
      { rotulo: "Faixa", valor: `${a.faixa}ª faixa`, formato: "texto" },
      { rotulo: "Alíquota nominal", valor: a.nominal * 100, formato: "percentual" },
    ],
    tabelas: [
      { titulo: SIMPLES[e.anexo].nome, colunas: ["Faixa", "Receita (RBT12)", "Alíquota nominal", "Parcela a deduzir"], linhas: linhasFaixas(e.anexo, a.faixa) },
    ],
    memoria: [
      `RBT12 de ${brl(rbt12)} → ${a.faixa}ª faixa do ${SIMPLES[e.anexo].nome}.`,
      `Alíquota efetiva = (${brl(rbt12)} × ${pct(a.nominal * 100)} − ${brl(a.deducao)}) ÷ ${brl(rbt12)} = ${pct(a.efetiva * 100)}.`,
      `DAS = receita do mês ${brl(e.receitaMes)} × ${pct(a.efetiva * 100)} = ${brl(das)}.`,
    ],
    alertas,
    baseLegal: BASE_LEGAL_SIMPLES,
  };
}

/* ---------- Simulador do Fator R ---------- */

export type EntradaFatorR = { folha12: number; rbt12: number; receitaMes: number };

export function calcularFatorR(e: EntradaFatorR): Resultado {
  if (e.rbt12 <= 0) throw new Error("Informe a receita bruta dos últimos 12 meses (RBT12).");
  const fator = e.folha12 / e.rbt12;
  const anexo: Anexo = fator >= FATOR_R_MINIMO ? "III" : "V";
  const iii = aliquotaEfetiva("III", e.rbt12);
  const v = aliquotaEfetiva("V", e.rbt12);
  const dasIII = r2(e.receitaMes * iii.efetiva);
  const dasV = r2(e.receitaMes * v.efetiva);
  const folhaMinima = r2(e.rbt12 * FATOR_R_MINIMO);
  const falta = r2(Math.max(0, folhaMinima - e.folha12));
  const economiaMensal = r2(dasV - dasIII);

  const alertas: string[] = [];
  if (anexo === "V" && falta > 0) {
    alertas.push(
      `Faltam ${brl(falta)} de folha nos 12 meses para atingir 28%. Aumentar o pró-labore gera INSS de 11% do sócio e pode gerar IRRF; compare com a economia de ${brl(economiaMensal)}/mês no DAS.`,
    );
  }
  alertas.push("O Fator R só vale para atividades sujeitas a ele (LC 123/2006, art. 18, § 5º-J e § 5º-M). Confira o CNAE.");

  return {
    destaques: [
      { rotulo: "Fator R", valor: r2(fator * 10000) / 100, formato: "percentual", principal: true },
      { rotulo: "Anexo aplicável", valor: `Anexo ${anexo}`, formato: "texto", tom: anexo === "III" ? "positivo" : "negativo" },
      { rotulo: "DAS no anexo aplicável", valor: anexo === "III" ? dasIII : dasV, formato: "moeda" },
      { rotulo: "Diferença mensal III × V", valor: economiaMensal, formato: "moeda" },
    ],
    tabelas: [
      {
        titulo: "Comparativo do mês",
        colunas: ["Anexo", "Alíquota efetiva", "DAS do mês"],
        linhas: [
          [`Anexo III${anexo === "III" ? " ◄" : ""}`, pct(iii.efetiva * 100), brl(dasIII)],
          [`Anexo V${anexo === "V" ? " ◄" : ""}`, pct(v.efetiva * 100), brl(dasV)],
        ],
      },
      {
        titulo: "Folha necessária",
        colunas: ["Item", "Valor"],
        linhas: [
          ["Folha dos últimos 12 meses", brl(e.folha12)],
          ["Folha mínima para 28%", brl(folhaMinima)],
          ["Falta para atingir 28%", brl(falta)],
          ["Equivale por mês a", brl(falta / 12)],
        ],
      },
    ],
    memoria: [
      `Fator R = folha de salários dos 12 meses (${brl(e.folha12)}) ÷ RBT12 (${brl(e.rbt12)}) = ${pct(fator * 100)}.`,
      fator >= FATOR_R_MINIMO
        ? "Fator R igual ou superior a 28%: tributação pelo Anexo III."
        : "Fator R inferior a 28%: tributação pelo Anexo V.",
      `Folha inclui salários, pró-labore, 13º, férias, FGTS e contribuição patronal (art. 18, § 24).`,
    ],
    alertas,
    baseLegal: [
      { norma: "LC 123/2006, art. 18, §§ 5º-J, 5º-M e 24", descricao: "Fator R: relação folha/receita de 28% define a tributação no Anexo III ou V." },
      ...BASE_LEGAL_SIMPLES,
    ],
  };
}
