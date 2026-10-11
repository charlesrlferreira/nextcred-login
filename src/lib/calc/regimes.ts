import { aliquotaEfetiva } from "./simples";
import {
  CPP_PATRONAL,
  DIVIDENDOS,
  FATOR_R_MINIMO,
  INSS_CONTRIBUINTE_INDIVIDUAL,
  INSS_TETO,
  PRESUMIDO,
  REAL,
  SALARIO_MINIMO,
  SIMPLES,
  SIMPLES_LIMITE,
  type Anexo,
} from "./tabelas";
import { BASE_LEGAL_IRRF, calcularIrrf } from "./inss-irrf";
import type { Resultado } from "./tipos";
import { brl, pct, r2 } from "./util";

/* ---------- Comparador de regimes tributários ---------- */

export type Atividade = "comercio" | "industria" | "servicos_fator_r" | "servicos_anexo_iii" | "servicos_anexo_iv";

export const ATIVIDADES: Record<Atividade, string> = {
  comercio: "Comércio (Anexo I)",
  industria: "Indústria (Anexo II)",
  servicos_fator_r: "Serviços sujeitos ao Fator R (Anexo III ou V)",
  servicos_anexo_iii: "Serviços do Anexo III",
  servicos_anexo_iv: "Serviços do Anexo IV (construção, advocacia, vigilância, limpeza)",
};

export type EntradaRegimes = {
  atividade: Atividade;
  faturamentoAnual: number;
  folhaAnual: number;
  custosDespesas: number;
  comprasComCredito: number;
  aliquotaIssIcms: number;
  encargosPatronais: number;
};

/** RAT médio usado para a CPP do Anexo IV, que fica fora do DAS. */
const RAT_ANEXO_IV = 0.02;

type Regime = { nome: string; aplicavel: boolean; motivo?: string; itens: Record<string, number>; total: number };

export function compararRegimes(e: EntradaRegimes): Resultado {
  const fat = e.faturamentoAnual;
  if (fat <= 0) throw new Error("Informe o faturamento anual.");
  const servicos = e.atividade.startsWith("servicos");
  const issIcms = r2(fat * (e.aliquotaIssIcms / 100));
  const patronal = r2(e.folhaAnual * (e.encargosPatronais / 100));
  const memoria: string[] = [];

  // Simples Nacional
  let anexo: Anexo =
    e.atividade === "comercio" ? "I" : e.atividade === "industria" ? "II" : e.atividade === "servicos_anexo_iv" ? "IV" : "III";
  if (e.atividade === "servicos_fator_r") {
    const fator = (e.folhaAnual * 1.08) / fat;
    anexo = fator >= FATOR_R_MINIMO ? "III" : "V";
    memoria.push(`Fator R estimado: folha + FGTS (${brl(e.folhaAnual * 1.08)}) ÷ faturamento = ${pct(fator * 100)} → Anexo ${anexo}.`);
  }
  const ef = aliquotaEfetiva(anexo, fat);
  const das = r2(fat * ef.efetiva);
  const cppIV = anexo === "IV" ? r2(e.folhaAnual * (CPP_PATRONAL + RAT_ANEXO_IV)) : 0;
  const simples: Regime = {
    nome: "Simples Nacional",
    aplicavel: fat <= SIMPLES_LIMITE,
    motivo: fat > SIMPLES_LIMITE ? `Faturamento acima de ${brl(SIMPLES_LIMITE)}` : undefined,
    itens: { DAS: das, "CPP fora do DAS (Anexo IV)": cppIV },
    total: r2(das + cppIV),
  };
  memoria.push(`Simples: ${SIMPLES[anexo].nome}, alíquota efetiva de ${pct(ef.efetiva * 100)} sobre ${brl(fat)} = ${brl(das)}.`);

  // Lucro Presumido
  const pIrpj = servicos ? PRESUMIDO.presuncaoIrpj.servicos : PRESUMIDO.presuncaoIrpj.comercio;
  const pCsll = servicos ? PRESUMIDO.presuncaoCsll.servicos : PRESUMIDO.presuncaoCsll.comercio;
  const excedente = Math.max(0, fat - PRESUMIDO.acrescimoReceitaAcima);
  const baseIrpj = r2(fat * pIrpj + excedente * pIrpj * PRESUMIDO.acrescimoPresuncao);
  const baseCsll = r2(fat * pCsll + excedente * pCsll * PRESUMIDO.acrescimoPresuncao);
  const irpjP = r2(baseIrpj * PRESUMIDO.irpj + Math.max(0, baseIrpj - PRESUMIDO.limiteAdicionalAnual) * PRESUMIDO.adicionalIrpj);
  const csllP = r2(baseCsll * PRESUMIDO.csll);
  const pisP = r2(fat * PRESUMIDO.pis);
  const cofinsP = r2(fat * PRESUMIDO.cofins);
  const presumido: Regime = {
    nome: "Lucro Presumido",
    aplicavel: fat <= PRESUMIDO.limiteOpcao,
    motivo: fat > PRESUMIDO.limiteOpcao ? "Faturamento acima de R$ 78 milhões" : undefined,
    itens: { IRPJ: irpjP, CSLL: csllP, PIS: pisP, Cofins: cofinsP, [servicos ? "ISS" : "ICMS"]: issIcms, "Encargos patronais": patronal },
    total: r2(irpjP + csllP + pisP + cofinsP + issIcms + patronal),
  };
  memoria.push(
    `Presumido: presunção de ${pct(pIrpj * 100)} (IRPJ) e ${pct(pCsll * 100)} (CSLL)${excedente ? `, acrescida de 10% sobre ${brl(excedente)} que excedem R$ 5 milhões (LC 224/2025)` : ""}; bases de ${brl(baseIrpj)} e ${brl(baseCsll)}.`,
    `IRPJ de 15% + adicional de 10% sobre o que passar de ${brl(PRESUMIDO.limiteAdicionalAnual)} no ano = ${brl(irpjP)}; CSLL 9% = ${brl(csllP)}; PIS 0,65% e Cofins 3% cumulativos.`,
  );

  // Lucro Real
  const pisCofinsR = r2(Math.max(0, fat - e.comprasComCredito) * (REAL.pis + REAL.cofins));
  const lucro = r2(fat - e.custosDespesas - e.folhaAnual - patronal - pisCofinsR - issIcms);
  const irpjR = lucro > 0 ? r2(lucro * 0.15 + Math.max(0, lucro - PRESUMIDO.limiteAdicionalAnual) * 0.1) : 0;
  const csllR = lucro > 0 ? r2(lucro * 0.09) : 0;
  const real: Regime = {
    nome: "Lucro Real",
    aplicavel: true,
    itens: { IRPJ: irpjR, CSLL: csllR, "PIS/Cofins não cumulativos": pisCofinsR, [servicos ? "ISS" : "ICMS"]: issIcms, "Encargos patronais": patronal },
    total: r2(irpjR + csllR + pisCofinsR + issIcms + patronal),
  };
  memoria.push(
    `Real: PIS/Cofins de 9,25% sobre faturamento menos compras com crédito = ${brl(pisCofinsR)}.`,
    `Lucro estimado = faturamento − custos/despesas − folha − encargos − tributos sobre receita = ${brl(lucro)}${lucro > 0 ? `; IRPJ ${brl(irpjR)} e CSLL ${brl(csllR)}` : " (prejuízo: sem IRPJ e CSLL)"}.`,
  );

  const regimes = [simples, presumido, real];
  const validos = regimes.filter((r) => r.aplicavel);
  const melhor = validos.reduce((a, b) => (b.total < a.total ? b : a));
  const segundo = validos.filter((r) => r !== melhor).reduce<Regime | null>((a, b) => (!a || b.total < a.total ? b : a), null);

  const rotulos = Array.from(new Set(regimes.flatMap((r) => Object.keys(r.itens))));
  const celula = (r: Regime, k: string) => (!r.aplicavel ? "—" : k in r.itens ? brl(r.itens[k]) : "—");

  return {
    destaques: [
      { rotulo: "Regime mais econômico", valor: melhor.nome, formato: "texto", principal: true, tom: "positivo" },
      { rotulo: "Carga anual no melhor regime", valor: melhor.total, formato: "moeda" },
      { rotulo: "Carga sobre o faturamento", valor: r2((melhor.total / fat) * 10000) / 100, formato: "percentual" },
      ...(segundo ? [{ rotulo: `Economia frente ao ${segundo.nome}`, valor: r2(segundo.total - melhor.total), formato: "moeda" as const, tom: "positivo" as const }] : []),
    ],
    tabelas: [
      {
        titulo: "Comparativo anual",
        colunas: ["Tributo", ...regimes.map((r) => r.nome)],
        linhas: [
          ...rotulos.filter((k) => regimes.some((r) => r.aplicavel && (r.itens[k] ?? 0) > 0)).map((k) => [k, ...regimes.map((r) => celula(r, k))]),
          ["Carga sobre o faturamento", ...regimes.map((r) => (r.aplicavel ? pct((r.total / fat) * 100) : r.motivo ?? "—"))],
        ],
        total: ["Total anual", ...regimes.map((r) => (r.aplicavel ? brl(r.total) : "Não se aplica"))],
      },
    ],
    memoria,
    alertas: [
      "Estimativa anual simplificada: não considera ICMS-ST, produtos monofásicos, benefícios fiscais, retenções nem saldos de prejuízo fiscal.",
      "A partir de 2027 a CBS substitui PIS/Cofins e, até 2033, IBS substitui ICMS e ISS (LC 214/2025). Refaça a simulação a cada ano.",
      "A opção pelo regime é anual e feita com o primeiro pagamento do ano (no Simples, até o último dia útil de janeiro).",
    ],
    baseLegal: [
      { norma: "LC 123/2006", descricao: "Simples Nacional: anexos, Fator R e limites de receita." },
      { norma: "Lei 9.249/1995, arts. 15 e 20; Lei 9.430/1996, arts. 25 e 29", descricao: "Percentuais de presunção do IRPJ e da CSLL." },
      { norma: "LC 224/2025", descricao: "Acréscimo de 10% nos percentuais de presunção sobre a receita anual que exceder R$ 5 milhões." },
      { norma: "Lei 9.718/1998 e Lei 12.814/2013", descricao: "PIS/Cofins cumulativos e limite de R$ 78 milhões para o Lucro Presumido." },
      { norma: "Leis 10.637/2002 e 10.833/2003", descricao: "PIS/Cofins não cumulativos (1,65% e 7,6%) com créditos." },
      { norma: "Lei 9.249/1995, art. 3º; Lei 7.689/1988", descricao: "IRPJ de 15% com adicional de 10% e CSLL de 9%." },
    ],
  };
}

/* ---------- Pró-labore x distribuição de lucros ---------- */

export type EntradaProLabore = {
  regime: "simples" | "simples_anexo_iv" | "presumido_real";
  retiradaMensal: number;
  dependentes: number;
};

type Cenario = { nome: string; proLabore: number; lucros: number; inss: number; irrf: number; irDividendos: number; cpp: number };

function cenario(nome: string, proLabore: number, lucros: number, cppAliquota: number, dependentes: number): Cenario {
  const inss = r2(Math.min(proLabore, INSS_TETO) * INSS_CONTRIBUINTE_INDIVIDUAL);
  const irrf = proLabore > 0 ? calcularIrrf(proLabore, inss, { dependentes }).imposto : 0;
  const irDividendos = lucros > DIVIDENDOS.limiteMensalIsento ? r2(lucros * DIVIDENDOS.aliquotaRetencao) : 0;
  return { nome, proLabore, lucros, inss, irrf, irDividendos, cpp: r2(proLabore * cppAliquota) };
}

export function compararProLabore(e: EntradaProLabore): Resultado {
  const cppAliquota = e.regime === "simples" ? 0 : CPP_PATRONAL;
  const total = e.retiradaMensal;
  const minimo = Math.min(SALARIO_MINIMO, total);
  const a = cenario("Tudo como pró-labore", total, 0, cppAliquota, e.dependentes);
  const b = cenario("Pró-labore de 1 salário mínimo + lucros", minimo, r2(total - minimo), cppAliquota, e.dependentes);
  const cenarios = [a, b];
  const custo = (c: Cenario) => r2(c.inss + c.irrf + c.irDividendos + c.cpp);
  const liquido = (c: Cenario) => r2(c.proLabore + c.lucros - c.inss - c.irrf - c.irDividendos);
  const economia = r2(custo(a) - custo(b));

  const alertas = [
    "Lucros só podem ser distribuídos se houver lucro apurado. Sem escrituração contábil, o limite isento é a base presumida menos os tributos (IN RFB 1.700/2017, art. 238).",
    "Pró-labore baixo reduz a base do benefício previdenciário do sócio e, no Fator R, pode levar a atividade ao Anexo V.",
    "Quem recebe mais de R$ 600 mil por ano entra no imposto mínimo da Lei 15.270/2025, apurado na declaração anual.",
  ];
  if (b.lucros > DIVIDENDOS.limiteMensalIsento)
    alertas.unshift(`Lucros acima de ${brl(DIVIDENDOS.limiteMensalIsento)} no mês, da mesma empresa para a mesma pessoa, têm retenção de 10% sobre o total pago.`);

  return {
    destaques: [
      { rotulo: "Economia mensal com lucros", valor: economia, formato: "moeda", principal: true, tom: economia >= 0 ? "positivo" : "negativo" },
      { rotulo: "Economia em 12 meses", valor: r2(economia * 12), formato: "moeda" },
      { rotulo: "Líquido só com pró-labore", valor: liquido(a), formato: "moeda" },
      { rotulo: "Líquido com pró-labore mínimo + lucros", valor: liquido(b), formato: "moeda" },
    ],
    tabelas: [
      {
        titulo: "Comparativo mensal",
        colunas: ["Item", ...cenarios.map((c) => c.nome)],
        linhas: [
          ["Pró-labore", ...cenarios.map((c) => brl(c.proLabore))],
          ["Lucros distribuídos", ...cenarios.map((c) => brl(c.lucros))],
          ["INSS do sócio (11%)", ...cenarios.map((c) => brl(c.inss))],
          ["IRRF sobre pró-labore", ...cenarios.map((c) => brl(c.irrf))],
          ["IR retido sobre lucros", ...cenarios.map((c) => brl(c.irDividendos))],
          ["CPP patronal (20%)", ...cenarios.map((c) => brl(c.cpp))],
          ["Líquido para o sócio", ...cenarios.map((c) => brl(liquido(c)))],
        ],
        total: ["Custo tributário total", ...cenarios.map((c) => brl(custo(c)))],
      },
    ],
    memoria: [
      `Retirada mensal analisada: ${brl(total)}.`,
      `INSS do sócio: 11% sobre o pró-labore, limitado ao teto de ${brl(INSS_TETO)}.`,
      cppAliquota
        ? "CPP patronal de 20% sobre o pró-labore (empresa fora do Simples ou no Anexo IV)."
        : "No Simples (Anexos I, II, III e V) a CPP já está no DAS: não há 20% patronal sobre o pró-labore.",
      `Lucros e dividendos: isentos até ${brl(DIVIDENDOS.limiteMensalIsento)} por mês por empresa pagadora; acima disso, retenção de 10% sobre o total.`,
    ],
    alertas,
    baseLegal: [
      { norma: "Lei 8.212/1991, arts. 21, 22 e 28, III", descricao: "Contribuição do contribuinte individual (11%) e patronal (20%) sobre o pró-labore." },
      { norma: "LC 123/2006, art. 13, VI, e art. 18, § 5º-C", descricao: "CPP incluída no DAS, exceto para o Anexo IV." },
      { norma: "Lei 9.249/1995, art. 10; Lei 15.270/2025", descricao: "Isenção de lucros e dividendos e retenção de 10% acima de R$ 50 mil/mês." },
      ...BASE_LEGAL_IRRF,
    ],
  };
}
