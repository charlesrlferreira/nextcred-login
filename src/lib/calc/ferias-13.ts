import { BASE_LEGAL_INSS, BASE_LEGAL_IRRF, calcularInss, calcularIrrf, memoriaIrrf } from "./inss-irrf";
import { diasFeriasPorFaltas } from "./tabelas";
import type { Resultado } from "./tipos";
import { brl, r2 } from "./util";

/* ---------- Férias ---------- */

export type EntradaFerias = {
  salario: number;
  mediaVariaveis: number;
  faltas: number;
  abonoPecuniario: boolean;
  dependentes: number;
};

export function calcularFerias(e: EntradaFerias): Resultado {
  const base = r2(e.salario + e.mediaVariaveis);
  const direito = diasFeriasPorFaltas(e.faltas);
  if (direito === 0) {
    return {
      destaques: [{ rotulo: "Dias de férias", valor: 0, formato: "numero", principal: true }],
      tabelas: [],
      memoria: [`Com ${e.faltas} faltas injustificadas no período aquisitivo, o empregado perde o direito às férias.`],
      alertas: ["Acima de 32 faltas injustificadas não há direito a férias (art. 130, IV, da CLT)."],
      baseLegal: [{ norma: "CLT, art. 130", descricao: "Proporção dos dias de férias conforme as faltas injustificadas." }],
    };
  }
  const diasAbono = e.abonoPecuniario ? Math.floor(direito / 3) : 0;
  const diasGozo = direito - diasAbono;
  const ferias = r2((base / 30) * diasGozo);
  const terco = r2(ferias / 3);
  const abono = r2((base / 30) * diasAbono);
  const tercoAbono = r2(abono / 3);

  const tributavel = r2(ferias + terco);
  const inss = calcularInss(tributavel).total;
  const ir = calcularIrrf(tributavel, inss, { dependentes: e.dependentes });
  const bruto = r2(tributavel + abono + tercoAbono);
  const liquido = r2(bruto - inss - ir.imposto);

  return {
    destaques: [
      { rotulo: "Líquido de férias", valor: liquido, formato: "moeda", principal: true },
      { rotulo: "Dias de gozo", valor: diasGozo, formato: "numero" },
      { rotulo: "INSS", valor: inss, formato: "moeda", tom: "negativo" },
      { rotulo: "IRRF", valor: ir.imposto, formato: "moeda", tom: "negativo" },
    ],
    tabelas: [
      {
        titulo: "Recibo de férias",
        colunas: ["Descrição", "Referência", "Valor"],
        linhas: [
          ["Férias", `${diasGozo} dias`, brl(ferias)],
          ["1/3 constitucional", "1/3", brl(terco)],
          ...(diasAbono ? [["Abono pecuniário", `${diasAbono} dias`, brl(abono)], ["1/3 sobre o abono", "1/3", brl(tercoAbono)]] : []),
          ["(−) INSS", "", brl(inss)],
          ["(−) IRRF", "", brl(ir.imposto)],
        ],
        total: ["Líquido", "", brl(liquido)],
      },
    ],
    memoria: [
      `Remuneração de referência: ${brl(e.salario)} + médias ${brl(e.mediaVariaveis)} = ${brl(base)}.`,
      `${e.faltas} faltas injustificadas → direito a ${direito} dias (art. 130).`,
      diasAbono ? `Abono pecuniário: 1/3 dos dias convertidos em dinheiro = ${diasAbono} dias; gozo de ${diasGozo} dias.` : `Gozo integral de ${diasGozo} dias.`,
      `Férias: ${brl(base)} ÷ 30 × ${diasGozo} = ${brl(ferias)}; 1/3 = ${brl(terco)}.`,
      `INSS sobre férias + 1/3 (${brl(tributavel)}): ${brl(inss)}. O abono pecuniário e seu 1/3 não sofrem INSS nem IRRF.`,
      ...memoriaIrrf("IRRF sobre férias (calculado em separado do salário do mês)", ir),
    ],
    alertas: [
      "O pagamento deve ser feito até 2 dias antes do início do gozo (art. 145 da CLT); fora do prazo, é devido em dobro.",
      "O INSS foi calculado só sobre as férias. Na folha, ele é somado aos demais salários do mês, respeitando o teto.",
    ],
    baseLegal: [
      { norma: "CLT, arts. 130, 142, 143 e 145", descricao: "Dias de férias, remuneração, abono pecuniário e prazo de pagamento." },
      { norma: "CF, art. 7º, XVII", descricao: "Adicional de 1/3 sobre as férias." },
      { norma: "Lei 8.212/1991, art. 28, § 9º, e, 6", descricao: "Abono pecuniário de férias não integra o salário de contribuição." },
      BASE_LEGAL_INSS,
      ...BASE_LEGAL_IRRF,
    ],
  };
}

/* ---------- 13º salário ---------- */

export type Entrada13 = {
  salario: number;
  mediaVariaveis: number;
  avos: number;
  parcela: "primeira" | "segunda" | "integral";
  adiantamentoPago: number;
  dependentes: number;
};

export function calcular13(e: Entrada13): Resultado {
  const base = r2(e.salario + e.mediaVariaveis);
  const total = r2((base / 12) * e.avos);
  const memoria = [`13º integral do ano: ${brl(base)} ÷ 12 × ${e.avos} avos = ${brl(total)}.`];

  if (e.parcela === "primeira") {
    const primeira = r2(total / 2);
    memoria.push(`1ª parcela: 50% de ${brl(total)} = ${brl(primeira)}, sem descontos de INSS e IRRF.`);
    return {
      destaques: [
        { rotulo: "1ª parcela a pagar", valor: primeira, formato: "moeda", principal: true },
        { rotulo: "13º integral do ano", valor: total, formato: "moeda" },
      ],
      tabelas: [
        { titulo: "1ª parcela", colunas: ["Descrição", "Valor"], linhas: [["Adiantamento de 50%", brl(primeira)]], total: ["A pagar", brl(primeira)] },
      ],
      memoria,
      alertas: ["A 1ª parcela deve ser paga entre 1º de fevereiro e 30 de novembro (ou nas férias, se o empregado pedir em janeiro)."],
      baseLegal: [{ norma: "Lei 4.749/1965, art. 2º", descricao: "Adiantamento da metade do 13º até 30 de novembro, sem descontos." }],
    };
  }

  const inss = calcularInss(total).total;
  const ir = calcularIrrf(total, inss, { dependentes: e.dependentes });
  const adiantamento = e.parcela === "segunda" ? e.adiantamentoPago || r2(total / 2) : 0;
  const liquido = r2(total - inss - ir.imposto - adiantamento);
  memoria.push(
    `INSS sobre o 13º integral (${brl(total)}): ${brl(inss)}.`,
    ...memoriaIrrf("IRRF sobre o 13º (tributação exclusiva, separada do salário)", ir),
  );
  if (adiantamento) memoria.push(`Desconto do adiantamento já pago: ${brl(adiantamento)}.`);

  return {
    destaques: [
      { rotulo: e.parcela === "segunda" ? "2ª parcela a pagar" : "13º líquido", valor: liquido, formato: "moeda", principal: true },
      { rotulo: "13º bruto", valor: total, formato: "moeda" },
      { rotulo: "INSS", valor: inss, formato: "moeda", tom: "negativo" },
      { rotulo: "IRRF", valor: ir.imposto, formato: "moeda", tom: "negativo" },
    ],
    tabelas: [
      {
        titulo: e.parcela === "segunda" ? "2ª parcela" : "13º em parcela única",
        colunas: ["Descrição", "Valor"],
        linhas: [
          ["13º salário bruto", brl(total)],
          ["(−) INSS", brl(inss)],
          ["(−) IRRF", brl(ir.imposto)],
          ...(adiantamento ? [["(−) 1ª parcela já paga", brl(adiantamento)]] : []),
        ],
        total: ["A pagar", brl(liquido)],
      },
    ],
    memoria,
    alertas: [
      "A 2ª parcela deve ser paga até 20 de dezembro.",
      "Pagamento em parcela única em dezembro descumpre o prazo da 1ª parcela (30/11).",
    ],
    baseLegal: [
      { norma: "Lei 4.090/1962 e Lei 4.749/1965", descricao: "Gratificação natalina, avos e prazos das parcelas." },
      BASE_LEGAL_INSS,
      { norma: "Lei 7.713/1988, art. 26", descricao: "Tributação exclusiva do 13º salário, separada dos demais rendimentos do mês." },
      ...BASE_LEGAL_IRRF.slice(1),
    ],
  };
}
