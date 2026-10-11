import { calcular13, calcularFerias } from "../calc/ferias-13";
import { calcularMultasJuros, precificarHonorarios } from "../calc/escritorio";
import { ferramentaInssIrrf } from "../calc/inss-irrf";
import { ATIVIDADES, compararProLabore, compararRegimes } from "../calc/regimes";
import { calcularRescisao, TIPOS_RESCISAO } from "../calc/rescisao";
import { calcularDas, calcularFatorR } from "../calc/simples";
import { SIMPLES } from "../calc/tabelas";
import type { Resultado } from "../calc/tipos";
import type { Campo } from "../campos";

export type { Campo, TipoCampo } from "../campos";

export type Area = "Departamento Pessoal" | "Tributário" | "Débitos e Multas" | "Escritório Contábil";

export type Ferramenta = {
  slug: string;
  nome: string;
  area: Area;
  resumo: string;
  campos: Campo[];
  /** Gera o título salvo no histórico a partir da entrada. */
  titulo: (e: Record<string, unknown>) => string;
  calcular: (e: Record<string, unknown>) => Resultado;
};

const opcoes = (obj: Record<string, string>) => Object.entries(obj).map(([valor, rotulo]) => ({ valor, rotulo }));
const brlCurto = (v: unknown) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const dependentes: Campo = { nome: "dependentes", rotulo: "Dependentes para IR", tipo: "inteiro", padrao: 0, min: 0, max: 20 };
const medias: Campo = {
  nome: "mediaVariaveis",
  rotulo: "Média de variáveis",
  tipo: "moeda",
  padrao: 0,
  ajuda: "Média de horas extras, comissões e adicionais habituais.",
};

// Os casts abaixo são seguros: a entrada já foi validada pelos campos declarados.
/* eslint-disable @typescript-eslint/no-explicit-any */
export const FERRAMENTAS: Ferramenta[] = [
  {
    slug: "rescisao",
    nome: "Calculadora de Rescisão",
    area: "Departamento Pessoal",
    resumo: "Verbas rescisórias nos 7 tipos de desligamento, com aviso proporcional, INSS, IRRF e FGTS.",
    campos: [
      { nome: "tipo", rotulo: "Tipo de desligamento", tipo: "selecao", opcoes: opcoes(TIPOS_RESCISAO), padrao: "sem_justa_causa" },
      { nome: "salario", rotulo: "Salário mensal", tipo: "moeda" },
      medias,
      { nome: "dataAdmissao", rotulo: "Data de admissão", tipo: "data" },
      { nome: "dataSaida", rotulo: "Último dia trabalhado", tipo: "data" },
      {
        nome: "aviso",
        rotulo: "Aviso prévio",
        tipo: "selecao",
        padrao: "indenizado",
        opcoes: [
          { valor: "indenizado", rotulo: "Indenizado" },
          { valor: "trabalhado", rotulo: "Trabalhado" },
          { valor: "nao_cumprido", rotulo: "Não cumprido pelo empregado (desconto)" },
          { valor: "dispensado", rotulo: "Dispensado pelo empregador" },
        ],
        mostrarSe: { campo: "tipo", valores: ["sem_justa_causa", "rescisao_indireta", "acordo", "pedido_demissao"] },
      },
      {
        nome: "dataTerminoContrato",
        rotulo: "Término previsto do contrato",
        tipo: "data",
        opcional: true,
        mostrarSe: { campo: "tipo", valores: ["antecipada_empregador"] },
      },
      {
        nome: "feriasVencidas",
        rotulo: "Períodos de férias vencidos",
        tipo: "inteiro",
        padrao: 0,
        min: 0,
        max: 3,
        ajuda: "Períodos aquisitivos completos (inclusive o que se completa na saída) com férias não gozadas.",
      },
      { nome: "feriasEmDobro", rotulo: "Desses, vencidos em dobro", tipo: "inteiro", padrao: 0, min: 0, max: 3, ajuda: "Períodos cujo prazo de concessão já passou (art. 137)." },
      { nome: "saldoFgts", rotulo: "Saldo do FGTS para fins rescisórios", tipo: "moeda", padrao: 0, ajuda: "Consta no extrato da Caixa; usado na multa." },
      dependentes,
    ],
    titulo: (e) => `${TIPOS_RESCISAO[e.tipo as keyof typeof TIPOS_RESCISAO]} — salário ${brlCurto(e.salario)}`,
    calcular: (e) => calcularRescisao(e as any),
  },
  {
    slug: "ferias",
    nome: "Calculadora de Férias",
    area: "Departamento Pessoal",
    resumo: "Férias com 1/3, abono pecuniário, dias conforme faltas, INSS e IRRF em separado.",
    campos: [
      { nome: "salario", rotulo: "Salário mensal", tipo: "moeda" },
      medias,
      { nome: "faltas", rotulo: "Faltas injustificadas no período aquisitivo", tipo: "inteiro", padrao: 0, min: 0, max: 365 },
      { nome: "abonoPecuniario", rotulo: "Vender 1/3 das férias (abono pecuniário)", tipo: "sim_nao", padrao: false },
      dependentes,
    ],
    titulo: (e) => `Férias — salário ${brlCurto(e.salario)}`,
    calcular: (e) => calcularFerias(e as any),
  },
  {
    slug: "decimo-terceiro",
    nome: "Calculadora de 13º Salário",
    area: "Departamento Pessoal",
    resumo: "1ª e 2ª parcelas ou parcela única, com avos, médias, INSS e IRRF exclusivo.",
    campos: [
      { nome: "salario", rotulo: "Salário mensal", tipo: "moeda" },
      medias,
      { nome: "avos", rotulo: "Meses trabalhados no ano (avos)", tipo: "inteiro", padrao: 12, min: 1, max: 12, ajuda: "Conta o mês com 15 dias ou mais trabalhados." },
      {
        nome: "parcela",
        rotulo: "Parcela",
        tipo: "selecao",
        padrao: "segunda",
        opcoes: [
          { valor: "primeira", rotulo: "1ª parcela (até 30/11)" },
          { valor: "segunda", rotulo: "2ª parcela (até 20/12)" },
          { valor: "integral", rotulo: "Parcela única / na rescisão" },
        ],
      },
      {
        nome: "adiantamentoPago",
        rotulo: "1ª parcela já paga",
        tipo: "moeda",
        padrao: 0,
        ajuda: "Deixe zero para considerar 50% do 13º.",
        mostrarSe: { campo: "parcela", valores: ["segunda"] },
      },
      dependentes,
    ],
    titulo: (e) => `13º salário — ${e.avos}/12 — salário ${brlCurto(e.salario)}`,
    calcular: (e) => calcular13(e as any),
  },
  {
    slug: "inss-irrf",
    nome: "Calculadora de INSS e IRRF",
    area: "Departamento Pessoal",
    resumo: "INSS progressivo por faixa e IRRF com desconto simplificado e o redutor de 2026.",
    campos: [
      { nome: "salario", rotulo: "Salário bruto", tipo: "moeda" },
      dependentes,
      { nome: "pensao", rotulo: "Pensão alimentícia judicial", tipo: "moeda", padrao: 0 },
      { nome: "previdenciaPrivada", rotulo: "Previdência privada (PGBL/Funpresp)", tipo: "moeda", padrao: 0 },
    ],
    titulo: (e) => `INSS e IRRF — salário ${brlCurto(e.salario)}`,
    calcular: (e) => ferramentaInssIrrf(e as any),
  },
  {
    slug: "das-simples",
    nome: "Calculadora do DAS (Simples Nacional)",
    area: "Tributário",
    resumo: "Alíquota efetiva e valor do DAS do mês a partir do RBT12 e do anexo.",
    campos: [
      { nome: "anexo", rotulo: "Anexo", tipo: "selecao", padrao: "III", opcoes: Object.entries(SIMPLES).map(([valor, a]) => ({ valor, rotulo: a.nome })) },
      { nome: "rbt12", rotulo: "Receita bruta dos últimos 12 meses (RBT12)", tipo: "moeda", ajuda: "Zero no primeiro mês de atividade." },
      { nome: "receitaMes", rotulo: "Receita do mês", tipo: "moeda" },
    ],
    titulo: (e) => `DAS Anexo ${e.anexo} — receita ${brlCurto(e.receitaMes)}`,
    calcular: (e) => calcularDas(e as any),
  },
  {
    slug: "fator-r",
    nome: "Simulador do Fator R",
    area: "Tributário",
    resumo: "Descubra se a atividade fica no Anexo III ou V e quanto de folha falta para 28%.",
    campos: [
      { nome: "folha12", rotulo: "Folha dos últimos 12 meses", tipo: "moeda", ajuda: "Salários, pró-labore, 13º, férias, FGTS e INSS patronal." },
      { nome: "rbt12", rotulo: "Receita bruta dos últimos 12 meses (RBT12)", tipo: "moeda" },
      { nome: "receitaMes", rotulo: "Receita do mês", tipo: "moeda" },
    ],
    titulo: (e) => `Fator R — RBT12 ${brlCurto(e.rbt12)}`,
    calcular: (e) => calcularFatorR(e as any),
  },
  {
    slug: "comparador-regimes",
    nome: "Comparador de Regimes Tributários",
    area: "Tributário",
    resumo: "Simples Nacional, Lucro Presumido e Lucro Real lado a lado, com a carga anual de cada um.",
    campos: [
      { nome: "atividade", rotulo: "Atividade", tipo: "selecao", padrao: "servicos_fator_r", opcoes: opcoes(ATIVIDADES) },
      { nome: "faturamentoAnual", rotulo: "Faturamento anual", tipo: "moeda" },
      { nome: "folhaAnual", rotulo: "Folha anual (salários + pró-labore)", tipo: "moeda", padrao: 0 },
      { nome: "custosDespesas", rotulo: "Custos e despesas anuais (exceto folha)", tipo: "moeda", padrao: 0, ajuda: "Usado para estimar o lucro no Lucro Real." },
      { nome: "comprasComCredito", rotulo: "Compras e despesas com crédito de PIS/Cofins", tipo: "moeda", padrao: 0 },
      { nome: "aliquotaIssIcms", rotulo: "ISS ou ICMS líquido sobre o faturamento (%)", tipo: "percentual", padrao: 5, ajuda: "Carga fora do Simples: ISS do município ou ICMS após créditos." },
      { nome: "encargosPatronais", rotulo: "Encargos patronais sobre a folha (%)", tipo: "percentual", padrao: 27.8, ajuda: "CPP 20% + RAT + terceiros, fora do Simples." },
    ],
    titulo: (e) => `Comparativo de regimes — faturamento ${brlCurto(e.faturamentoAnual)}`,
    calcular: (e) => compararRegimes(e as any),
  },
  {
    slug: "pro-labore-lucros",
    nome: "Pró-labore x Distribuição de Lucros",
    area: "Tributário",
    resumo: "Quanto o sócio economiza retirando parte como lucros, já com a regra de dividendos de 2026.",
    campos: [
      {
        nome: "regime",
        rotulo: "Regime da empresa",
        tipo: "selecao",
        padrao: "simples",
        opcoes: [
          { valor: "simples", rotulo: "Simples Nacional (Anexos I, II, III ou V)" },
          { valor: "simples_anexo_iv", rotulo: "Simples Nacional — Anexo IV" },
          { valor: "presumido_real", rotulo: "Lucro Presumido ou Real" },
        ],
      },
      { nome: "retiradaMensal", rotulo: "Retirada mensal desejada pelo sócio", tipo: "moeda" },
      dependentes,
    ],
    titulo: (e) => `Pró-labore x lucros — retirada ${brlCurto(e.retiradaMensal)}`,
    calcular: (e) => compararProLabore(e as any),
  },
  {
    slug: "multas-juros",
    nome: "Multas e Juros de Tributos em Atraso",
    area: "Débitos e Multas",
    resumo: "Multa de mora de 0,33% ao dia (até 20%) e juros Selic para tributos federais.",
    campos: [
      { nome: "principal", rotulo: "Valor do tributo (principal)", tipo: "moeda" },
      { nome: "vencimento", rotulo: "Data de vencimento", tipo: "data" },
      { nome: "pagamento", rotulo: "Data do pagamento", tipo: "data" },
      {
        nome: "selicAcumulada",
        rotulo: "Selic acumulada no período (%)",
        tipo: "percentual",
        padrao: 0,
        ajuda: "Do mês seguinte ao vencimento até o mês anterior ao pagamento (tabela da Receita Federal).",
      },
    ],
    titulo: (e) => `Acréscimos sobre ${brlCurto(e.principal)} vencido em ${String(e.vencimento).split("-").reverse().join("/")}`,
    calcular: (e) => calcularMultasJuros(e as any),
  },
  {
    slug: "honorarios",
    nome: "Precificação de Honorários",
    area: "Escritório Contábil",
    resumo: "Honorário mensal a partir do custo da hora, do porte do cliente, dos tributos e da margem.",
    campos: [
      { nome: "custosFixosMensais", rotulo: "Custos fixos mensais do escritório", tipo: "moeda", ajuda: "Salários, aluguel, sistemas, pró-labore e demais despesas." },
      { nome: "horasProdutivasMes", rotulo: "Horas produtivas da equipe no mês", tipo: "numero", padrao: 352, ajuda: "Ex.: 2 pessoas × 176 h." },
      {
        nome: "regime",
        rotulo: "Regime do cliente",
        tipo: "selecao",
        padrao: "simples",
        opcoes: [
          { valor: "mei", rotulo: "MEI" },
          { valor: "simples", rotulo: "Simples Nacional" },
          { valor: "presumido", rotulo: "Lucro Presumido" },
          { valor: "real", rotulo: "Lucro Real" },
        ],
      },
      { nome: "funcionarios", rotulo: "Funcionários do cliente", tipo: "inteiro", padrao: 0, min: 0 },
      { nome: "notasMes", rotulo: "Notas fiscais por mês", tipo: "inteiro", padrao: 0, min: 0 },
      { nome: "horasExtras", rotulo: "Horas adicionais por mês", tipo: "numero", padrao: 0, ajuda: "Reuniões, atendimento e rotinas específicas." },
      {
        nome: "complexidade",
        rotulo: "Complexidade",
        tipo: "selecao",
        padrao: "media",
        opcoes: [
          { valor: "baixa", rotulo: "Baixa (× 1,0)" },
          { valor: "media", rotulo: "Média (× 1,2)" },
          { valor: "alta", rotulo: "Alta (× 1,5)" },
        ],
      },
      { nome: "tributosHonorarios", rotulo: "Tributos sobre o honorário (%)", tipo: "percentual", padrao: 6, ajuda: "Alíquota efetiva do seu escritório." },
      { nome: "margem", rotulo: "Margem de lucro desejada (%)", tipo: "percentual", padrao: 25 },
    ],
    titulo: (e) => `Honorários — cliente ${String(e.regime).toUpperCase()}`,
    calcular: (e) => precificarHonorarios(e as any),
  },
];
/* eslint-enable @typescript-eslint/no-explicit-any */

export const AREAS: Area[] = ["Departamento Pessoal", "Tributário", "Débitos e Multas", "Escritório Contábil"];

export function buscarFerramenta(slug: string): Ferramenta | undefined {
  return FERRAMENTAS.find((f) => f.slug === slug);
}
