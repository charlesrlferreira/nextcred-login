import { MULTA_MORA } from "./tabelas";
import type { Resultado } from "./tipos";
import { brl, diffDias, fmtData, parseData, pct, r2 } from "./util";

/* ---------- Multas e juros de tributos federais em atraso ---------- */

export type EntradaMultasJuros = {
  principal: number;
  vencimento: string;
  pagamento: string;
  selicAcumulada: number;
};

export function calcularMultasJuros(e: EntradaMultasJuros): Resultado {
  const venc = parseData(e.vencimento);
  const pag = parseData(e.pagamento);
  const dias = diffDias(venc, pag);
  if (dias <= 0) {
    return {
      destaques: [{ rotulo: "Total a pagar", valor: e.principal, formato: "moeda", principal: true }],
      tabelas: [],
      memoria: ["Pagamento até o vencimento: sem multa e sem juros."],
      alertas: [],
      baseLegal: [{ norma: "Lei 9.430/1996, art. 61", descricao: "Acréscimos moratórios só incidem após o vencimento." }],
    };
  }
  const percMulta = Math.min(dias * MULTA_MORA.porDia, MULTA_MORA.limite);
  const multa = r2(e.principal * percMulta);
  const meses =
    (pag.getUTCFullYear() - venc.getUTCFullYear()) * 12 + (pag.getUTCMonth() - venc.getUTCMonth());
  const percJuros = meses <= 0 ? 0 : (e.selicAcumulada + 1) / 100;
  const juros = r2(e.principal * percJuros);
  const total = r2(e.principal + multa + juros);

  const alertas: string[] = [];
  if (meses <= 1 && e.selicAcumulada > 0)
    alertas.push("Pagamento no mês seguinte ao vencimento: só incide 1% de juros. A Selic informada foi desconsiderada.");
  if (meses > 1 && e.selicAcumulada <= 0)
    alertas.push("Informe a Selic acumulada do mês seguinte ao vencimento até o mês anterior ao pagamento (tabela da Receita Federal).");
  alertas.push("Débito já sob ação fiscal não admite pagamento só com multa de mora: a multa de ofício é de 75% (Lei 9.430/1996, art. 44).");

  return {
    destaques: [
      { rotulo: "Total a pagar", valor: total, formato: "moeda", principal: true },
      { rotulo: "Multa de mora", valor: multa, formato: "moeda", tom: "negativo" },
      { rotulo: "Juros", valor: juros, formato: "moeda", tom: "negativo" },
      { rotulo: "Dias de atraso", valor: dias, formato: "numero" },
    ],
    tabelas: [
      {
        titulo: "Cálculo dos acréscimos",
        colunas: ["Item", "Percentual", "Valor"],
        linhas: [
          ["Principal", "", brl(e.principal)],
          ["Multa de mora", pct(percMulta * 100), brl(multa)],
          ["Juros (Selic acumulada + 1%)", pct(percJuros * 100), brl(juros)],
        ],
        total: ["Total", "", brl(total)],
      },
    ],
    memoria: [
      `Vencimento em ${fmtData(e.vencimento)} e pagamento em ${fmtData(e.pagamento)}: ${dias} dias de atraso.`,
      `Multa: 0,33% × ${dias} dias = ${pct(dias * 0.33)}${dias * MULTA_MORA.porDia > MULTA_MORA.limite ? ", limitada a 20%" : ""} → ${brl(multa)}.`,
      meses <= 0
        ? "Pagamento no mesmo mês do vencimento: sem juros."
        : meses === 1
          ? "Pagamento no mês seguinte ao vencimento: juros de 1%."
          : `Juros: Selic acumulada de ${pct(e.selicAcumulada)} + 1% do mês do pagamento = ${pct(percJuros * 100)} → ${brl(juros)}.`,
    ],
    alertas,
    baseLegal: [
      { norma: "Lei 9.430/1996, art. 61, §§ 1º a 3º", descricao: "Multa de mora de 0,33% ao dia, limitada a 20%, e juros pela Selic acumulada mais 1% no mês do pagamento." },
      { norma: "CTN, art. 138", descricao: "Denúncia espontânea: pagamento antes de procedimento fiscal afasta a multa de ofício." },
    ],
  };
}

/* ---------- Precificação de honorários ---------- */

export type RegimeCliente = "mei" | "simples" | "presumido" | "real";

export const HORAS_BASE: Record<RegimeCliente, number> = { mei: 1.5, simples: 6, presumido: 12, real: 24 };
const HORAS_POR_FUNCIONARIO = 0.6;
const HORAS_POR_100_NOTAS = 1;
const COMPLEXIDADE = { baixa: 1, media: 1.2, alta: 1.5 } as const;

export type EntradaHonorarios = {
  custosFixosMensais: number;
  horasProdutivasMes: number;
  regime: RegimeCliente;
  funcionarios: number;
  notasMes: number;
  horasExtras: number;
  complexidade: keyof typeof COMPLEXIDADE;
  tributosHonorarios: number;
  margem: number;
};

export function precificarHonorarios(e: EntradaHonorarios): Resultado {
  if (e.horasProdutivasMes <= 0) throw new Error("Informe as horas produtivas da equipe no mês.");
  const somaPercentuais = (e.tributosHonorarios + e.margem) / 100;
  if (somaPercentuais >= 1) throw new Error("Tributos + margem devem ficar abaixo de 100%.");

  const custoHora = e.custosFixosMensais / e.horasProdutivasMes;
  const horasBase = HORAS_BASE[e.regime];
  const horasFolha = e.funcionarios * HORAS_POR_FUNCIONARIO;
  const horasNotas = (e.notasMes / 100) * HORAS_POR_100_NOTAS;
  const fator = COMPLEXIDADE[e.complexidade];
  const horas = (horasBase + horasFolha + horasNotas + e.horasExtras) * fator;
  const custo = r2(horas * custoHora);
  const preco = r2(custo / (1 - somaPercentuais));
  const tributos = r2(preco * (e.tributosHonorarios / 100));
  const lucro = r2(preco - custo - tributos);

  return {
    destaques: [
      { rotulo: "Honorário mensal sugerido", valor: preco, formato: "moeda", principal: true },
      { rotulo: "Horas estimadas no mês", valor: r2(horas), formato: "numero" },
      { rotulo: "Custo da hora do escritório", valor: r2(custoHora), formato: "moeda" },
      { rotulo: "Lucro mensal no cliente", valor: lucro, formato: "moeda", tom: "positivo" },
    ],
    tabelas: [
      {
        titulo: "Composição das horas",
        colunas: ["Item", "Horas"],
        linhas: [
          [`Rotina base do regime (${e.regime.toUpperCase()})`, String(horasBase)],
          [`Folha: ${e.funcionarios} funcionário(s) × ${HORAS_POR_FUNCIONARIO} h`, String(r2(horasFolha))],
          [`Notas fiscais: ${e.notasMes} por mês`, String(r2(horasNotas))],
          ["Horas adicionais informadas", String(e.horasExtras)],
          [`Fator de complexidade (${e.complexidade})`, `× ${fator}`],
        ],
        total: ["Total de horas", String(r2(horas))],
      },
      {
        titulo: "Formação do preço",
        colunas: ["Item", "Valor"],
        linhas: [
          ["Custo das horas", brl(custo)],
          [`Tributos sobre o honorário (${pct(e.tributosHonorarios)})`, brl(tributos)],
          [`Margem de lucro (${pct(e.margem)})`, brl(lucro)],
        ],
        total: ["Honorário", brl(preco)],
      },
    ],
    memoria: [
      `Custo da hora: custos fixos ${brl(e.custosFixosMensais)} ÷ ${e.horasProdutivasMes} horas produtivas = ${brl(custoHora)}.`,
      `Horas do cliente: (${horasBase} + ${r2(horasFolha)} + ${r2(horasNotas)} + ${e.horasExtras}) × ${fator} = ${r2(horas)} h.`,
      `Preço = custo ${brl(custo)} ÷ (1 − tributos ${pct(e.tributosHonorarios)} − margem ${pct(e.margem)}) = ${brl(preco)}.`,
    ],
    alertas: [
      "As horas por regime, por funcionário e por nota são referências iniciais: ajuste-as com o tempo real medido no seu escritório.",
      "Inclua no contrato o reajuste anual e os serviços extras cobrados à parte (alterações contratuais, certidões, IRPF dos sócios).",
    ],
    baseLegal: [
      { norma: "Resolução CFC 1.590/2020", descricao: "Contrato de prestação de serviços contábeis obrigatório, com escopo e honorários." },
      { norma: "Código Civil, arts. 594 a 609", descricao: "Prestação de serviços e retribuição ajustada entre as partes." },
    ],
  };
}
