import { BASE_LEGAL_INSS, calcularInss, calcularIrrf, memoriaIrrf } from "./inss-irrf";
import type { Resultado } from "./tipos";
import {
  anosCompletos,
  brl,
  diasNoMes,
  diffDias,
  fmtData,
  isoData,
  parseData,
  r2,
  somaDias,
  somaMeses,
} from "./util";

export type TipoRescisao =
  | "sem_justa_causa"
  | "pedido_demissao"
  | "justa_causa"
  | "acordo"
  | "rescisao_indireta"
  | "termino_contrato"
  | "antecipada_empregador";

export type AvisoPrevio = "indenizado" | "trabalhado" | "nao_cumprido" | "dispensado";

export type EntradaRescisao = {
  tipo: TipoRescisao;
  salario: number;
  mediaVariaveis: number;
  dataAdmissao: string;
  dataSaida: string;
  aviso: AvisoPrevio;
  dataTerminoContrato?: string;
  feriasVencidas: number;
  feriasEmDobro: number;
  saldoFgts: number;
  dependentes: number;
};

export const TIPOS_RESCISAO: Record<TipoRescisao, string> = {
  sem_justa_causa: "Dispensa sem justa causa",
  pedido_demissao: "Pedido de demissão",
  justa_causa: "Dispensa por justa causa",
  acordo: "Acordo entre as partes (art. 484-A)",
  rescisao_indireta: "Rescisão indireta",
  termino_contrato: "Término do contrato por prazo determinado",
  antecipada_empregador: "Contrato determinado encerrado antes pelo empregador",
};

/** Dias de aviso prévio proporcional: 30 + 3 por ano completo, até 90 (Lei 12.506/2011). */
export function diasAvisoProporcional(admissao: Date, saida: Date): number {
  return Math.min(90, 30 + 3 * anosCompletos(admissao, saida));
}

/** Avos de 13º no ano da data final: meses com 15 dias ou mais trabalhados. */
export function avos13(admissao: Date, fim: Date): number {
  const ano = fim.getUTCFullYear();
  let avos = 0;
  for (let mes = 0; mes <= fim.getUTCMonth(); mes++) {
    const inicioMes = new Date(Date.UTC(ano, mes, 1));
    const fimMes = new Date(Date.UTC(ano, mes, diasNoMes(ano, mes)));
    const ini = admissao > inicioMes ? admissao : inicioMes;
    const fi = fim < fimMes ? fim : fimMes;
    if (fi >= ini && diffDias(ini, fi) + 1 >= 15) avos++;
  }
  return avos;
}

/** Avos de férias de um período aquisitivo: meses completos + fração de 15 dias ou mais. */
export function avosFerias(inicio: Date, fim: Date): number {
  const fimExclusivo = somaDias(fim, 1);
  let meses = 0;
  while (meses < 12 && somaMeses(inicio, meses + 1) <= fimExclusivo) meses++;
  if (meses < 12 && diffDias(somaMeses(inicio, meses), fimExclusivo) >= 15) meses++;
  return meses;
}

/** Dias de saldo de salário no mês da saída (mês comercial de 30 dias). */
export function diasSaldoSalario(admissao: Date, saida: Date): number {
  const mesmoMes =
    admissao.getUTCFullYear() === saida.getUTCFullYear() && admissao.getUTCMonth() === saida.getUTCMonth();
  const ultimoDia = saida.getUTCDate() === diasNoMes(saida.getUTCFullYear(), saida.getUTCMonth());
  if (!mesmoMes && ultimoDia) return 30;
  const dias = mesmoMes ? saida.getUTCDate() - admissao.getUTCDate() + 1 : saida.getUTCDate();
  return Math.min(30, dias);
}

type Verba = { descricao: string; referencia: string; valor: number; inss: "mensal" | "13" | "nao"; ir: "mensal" | "13" | "isento" };

export function calcularRescisao(e: EntradaRescisao): Resultado {
  const admissao = parseData(e.dataAdmissao);
  const saida = parseData(e.dataSaida);
  if (saida < admissao) throw new Error("A data de saída deve ser posterior à data de admissão.");

  const base = r2(e.salario + e.mediaVariaveis);
  const diaria = base / 30;
  const t = e.tipo;
  const memoria: string[] = [];
  const alertas: string[] = [];
  const verbas: Verba[] = [];
  const descontos: { descricao: string; valor: number }[] = [];

  memoria.push(
    `Remuneração de referência: salário ${brl(e.salario)} + médias variáveis ${brl(e.mediaVariaveis)} = ${brl(base)} (diária de ${brl(diaria)}).`,
  );

  // Saldo de salário
  const diasSaldo = diasSaldoSalario(admissao, saida);
  const saldo = r2((e.salario / 30) * diasSaldo);
  verbas.push({ descricao: "Saldo de salário", referencia: `${diasSaldo} dias`, valor: saldo, inss: "mensal", ir: "mensal" });
  memoria.push(`Saldo de salário: ${brl(e.salario)} ÷ 30 × ${diasSaldo} dias = ${brl(saldo)}.`);

  // Aviso prévio
  const diasAviso = diasAvisoProporcional(admissao, saida);
  let diasIndenizados = 0;
  const comAviso = t === "sem_justa_causa" || t === "rescisao_indireta" || t === "acordo";
  if (comAviso) {
    if (e.aviso === "trabalhado") {
      diasIndenizados = t === "acordo" ? 0 : diasAviso - 30;
      memoria.push(
        `Aviso prévio de ${diasAviso} dias (30 + 3 por ano completo). Trabalhados 30 dias${diasIndenizados ? `; os ${diasIndenizados} dias proporcionais são indenizados` : ""}.`,
      );
    } else {
      diasIndenizados = t === "acordo" ? Math.floor(diasAviso / 2) : diasAviso;
      memoria.push(
        t === "acordo"
          ? `Aviso prévio de ${diasAviso} dias; no acordo do art. 484-A é devida a metade: ${diasIndenizados} dias indenizados.`
          : `Aviso prévio proporcional de ${diasAviso} dias (30 + 3 por ano completo), indenizado.`,
      );
    }
    if (diasIndenizados > 0) {
      const valor = r2(diaria * diasIndenizados);
      verbas.push({ descricao: "Aviso prévio indenizado", referencia: `${diasIndenizados} dias`, valor, inss: "nao", ir: "isento" });
    }
  }
  if (t === "pedido_demissao" && e.aviso === "nao_cumprido") {
    const valor = r2(e.salario);
    descontos.push({ descricao: "Aviso prévio não cumprido (art. 487, § 2º)", valor });
    memoria.push(`Pedido de demissão sem cumprir o aviso: desconto de 30 dias de salário = ${brl(valor)}.`);
  }

  // Data projetada pelo aviso indenizado (conta como tempo de serviço)
  const fimProjetado = somaDias(saida, diasIndenizados);
  if (diasIndenizados > 0) memoria.push(`Projeção do aviso: a data final para avos passa a ${fmtData(isoData(fimProjetado))}.`);

  // Indenização do art. 479
  if (t === "antecipada_empregador") {
    if (!e.dataTerminoContrato) throw new Error("Informe a data prevista para o término do contrato.");
    const termino = parseData(e.dataTerminoContrato);
    const restantes = Math.max(0, diffDias(saida, termino));
    const valor = r2((diaria * restantes) / 2);
    verbas.push({ descricao: "Indenização do art. 479 da CLT", referencia: `${restantes} dias ÷ 2`, valor, inss: "nao", ir: "isento" });
    memoria.push(`Art. 479: metade da remuneração dos ${restantes} dias que faltavam até ${fmtData(e.dataTerminoContrato)} = ${brl(valor)}.`);
  }

  // 13º proporcional
  if (t !== "justa_causa") {
    const avos = avos13(admissao, fimProjetado);
    if (avos > 0) {
      const valor = r2((base / 12) * avos);
      verbas.push({ descricao: "13º salário proporcional", referencia: `${avos}/12`, valor, inss: "13", ir: "13" });
      memoria.push(`13º proporcional: ${brl(base)} ÷ 12 × ${avos} avos = ${brl(valor)}.`);
    }
  }

  // Férias vencidas
  if (e.feriasVencidas > 0) {
    const valor = r2(base * e.feriasVencidas);
    verbas.push({ descricao: "Férias vencidas", referencia: `${e.feriasVencidas} período(s)`, valor, inss: "nao", ir: "isento" });
    verbas.push({ descricao: "1/3 sobre férias vencidas", referencia: "1/3", valor: r2(valor / 3), inss: "nao", ir: "isento" });
    memoria.push(`Férias vencidas: ${e.feriasVencidas} × ${brl(base)} + 1/3 = ${brl(valor + valor / 3)}.`);
  }
  const emDobro = Math.min(e.feriasEmDobro, e.feriasVencidas);
  if (emDobro > 0) {
    const valor = r2(base * emDobro);
    verbas.push({ descricao: "Dobra das férias fora do prazo (art. 137)", referencia: `${emDobro} período(s)`, valor, inss: "nao", ir: "isento" });
    verbas.push({ descricao: "1/3 sobre a dobra", referencia: "1/3", valor: r2(valor / 3), inss: "nao", ir: "isento" });
  }

  // Férias proporcionais
  if (t !== "justa_causa") {
    const anos = anosCompletos(admissao, somaDias(fimProjetado, 1));
    const inicioPeriodo = somaMeses(admissao, anos * 12);
    const avos = inicioPeriodo <= fimProjetado ? avosFerias(inicioPeriodo, fimProjetado) : 0;
    if (avos > 0) {
      const valor = r2((base / 12) * avos);
      verbas.push({ descricao: "Férias proporcionais", referencia: `${avos}/12`, valor, inss: "nao", ir: "isento" });
      verbas.push({ descricao: "1/3 sobre férias proporcionais", referencia: "1/3", valor: r2(valor / 3), inss: "nao", ir: "isento" });
      memoria.push(
        `Férias proporcionais do período iniciado em ${fmtData(isoData(inicioPeriodo))}: ${brl(base)} ÷ 12 × ${avos} avos = ${brl(valor)} + 1/3 = ${brl(valor + valor / 3)}.`,
      );
    }
  } else {
    alertas.push("Na justa causa não são devidos aviso prévio, 13º proporcional e férias proporcionais; férias vencidas continuam devidas.");
  }

  // Encargos do empregado
  const baseInssMensal = r2(verbas.filter((v) => v.inss === "mensal").reduce((s, v) => s + v.valor, 0));
  const base13 = r2(verbas.filter((v) => v.inss === "13").reduce((s, v) => s + v.valor, 0));
  const inssMensal = calcularInss(baseInssMensal).total;
  const inss13 = calcularInss(base13).total;
  const irMensal = calcularIrrf(baseInssMensal, inssMensal, { dependentes: e.dependentes });
  const ir13 = calcularIrrf(base13, inss13, { dependentes: e.dependentes });

  memoria.push(`INSS sobre o saldo de salário (${brl(baseInssMensal)}): ${brl(inssMensal)}. INSS sobre o 13º (${brl(base13)}): ${brl(inss13)}, calculado em separado.`);
  memoria.push(...memoriaIrrf("IRRF sobre o saldo de salário", irMensal));
  if (base13 > 0) memoria.push(...memoriaIrrf("IRRF sobre o 13º (tributação exclusiva)", ir13));
  memoria.push("Aviso prévio indenizado, férias indenizadas com 1/3 e a indenização do art. 479 não sofrem INSS nem IRRF.");

  if (inssMensal) descontos.push({ descricao: "INSS sobre saldo de salário", valor: inssMensal });
  if (inss13) descontos.push({ descricao: "INSS sobre 13º salário", valor: inss13 });
  if (irMensal.imposto) descontos.push({ descricao: "IRRF sobre saldo de salário", valor: irMensal.imposto });
  if (ir13.imposto) descontos.push({ descricao: "IRRF sobre 13º salário", valor: ir13.imposto });

  const totalBruto = r2(verbas.reduce((s, v) => s + v.valor, 0));
  const totalDescontos = r2(descontos.reduce((s, d) => s + d.valor, 0));
  const liquido = r2(totalBruto - totalDescontos);

  // FGTS
  const baseFgts = r2(
    verbas.filter((v) => v.descricao === "Saldo de salário" || v.descricao === "Aviso prévio indenizado" || v.inss === "13").reduce((s, v) => s + v.valor, 0),
  );
  const depositoRescisorio = r2(baseFgts * 0.08);
  const percentualMulta = t === "sem_justa_causa" || t === "rescisao_indireta" || t === "antecipada_empregador" ? 0.4 : t === "acordo" ? 0.2 : 0;
  const baseMulta = r2(e.saldoFgts + depositoRescisorio);
  const multa = r2(baseMulta * percentualMulta);
  const percentualSaque =
    t === "sem_justa_causa" || t === "rescisao_indireta" || t === "antecipada_empregador" || t === "termino_contrato" ? 1 : t === "acordo" ? 0.8 : 0;
  const saque = r2(baseMulta * percentualSaque);
  memoria.push(
    `FGTS do mês da rescisão: 8% × ${brl(baseFgts)} (saldo, aviso indenizado e 13º) = ${brl(depositoRescisorio)}.`,
    percentualMulta
      ? `Multa rescisória de ${percentualMulta * 100}% sobre ${brl(baseMulta)} (saldo informado + depósito rescisório) = ${brl(multa)}, depositada na conta vinculada.`
      : "Sem multa rescisória do FGTS para este tipo de desligamento.",
  );

  const seguroDesemprego = t === "sem_justa_causa" || t === "rescisao_indireta" || t === "antecipada_empregador";
  const prazo = fmtData(isoData(somaDias(saida, 10)));
  alertas.push(`Prazo para pagamento das verbas e entrega dos documentos: até ${prazo} (10 dias corridos após o término — art. 477, § 6º, da CLT).`);
  if (t === "acordo") alertas.push("No acordo do art. 484-A, o empregado não tem direito ao seguro-desemprego e saca até 80% do FGTS.");
  if (e.aviso === "nao_cumprido" && t !== "pedido_demissao") alertas.push("O desconto de aviso não cumprido só se aplica ao pedido de demissão.");
  if (liquido < 0) alertas.push("Os descontos superam as verbas: o desconto do aviso deve respeitar o limite de uma remuneração (art. 477, § 5º).");

  return {
    destaques: [
      { rotulo: "Líquido a receber", valor: liquido, formato: "moeda", principal: true },
      { rotulo: "Total de verbas", valor: totalBruto, formato: "moeda" },
      { rotulo: "Total de descontos", valor: totalDescontos, formato: "moeda", tom: "negativo" },
      { rotulo: "Multa do FGTS (à parte)", valor: multa, formato: "moeda" },
    ],
    tabelas: [
      {
        titulo: "Verbas rescisórias",
        colunas: ["Verba", "Referência", "Valor"],
        linhas: verbas.map((v) => [v.descricao, v.referencia, brl(v.valor)]),
        total: ["Total de verbas", "", brl(totalBruto)],
      },
      {
        titulo: "Descontos",
        colunas: ["Desconto", "Valor"],
        linhas: descontos.length ? descontos.map((d) => [d.descricao, brl(d.valor)]) : [["Nenhum desconto", brl(0)]],
        total: ["Total de descontos", brl(totalDescontos)],
      },
      {
        titulo: "FGTS e direitos (não entram no líquido)",
        colunas: ["Item", "Valor / situação"],
        linhas: [
          ["Saldo do FGTS informado", brl(e.saldoFgts)],
          ["Depósito do mês da rescisão (8%)", brl(depositoRescisorio)],
          [`Multa rescisória (${percentualMulta * 100}%)`, brl(multa)],
          ["Saque liberado", percentualSaque ? `${percentualSaque * 100}% — ${brl(saque)}` : "Não"],
          ["Seguro-desemprego", seguroDesemprego ? "Sim, se cumpridos os requisitos" : "Não"],
          ["Dias de aviso prévio proporcional", comAviso ? `${diasAviso} dias` : "Não se aplica"],
        ],
      },
    ],
    memoria,
    alertas,
    baseLegal: [
      { norma: "CLT, arts. 477, 478 a 480 e 484-A", descricao: "Prazo de pagamento, indenização em contratos por prazo determinado e rescisão por acordo." },
      { norma: "CLT, art. 487 e Lei 12.506/2011", descricao: "Aviso prévio de 30 dias acrescido de 3 dias por ano completo, até 90 dias; projeção no tempo de serviço." },
      { norma: "Lei 4.090/1962 e Decreto 57.155/1965", descricao: "13º salário proporcional: 1/12 por mês com 15 dias ou mais trabalhados." },
      { norma: "CLT, arts. 130, 137, 146 e 147; CF, art. 7º, XVII", descricao: "Férias vencidas, em dobro e proporcionais, acrescidas de 1/3." },
      { norma: "Lei 8.036/1990, arts. 15, 18 e 20", descricao: "Depósito de 8%, multa de 40% (20% no acordo) e hipóteses de saque do FGTS." },
      BASE_LEGAL_INSS,
      { norma: "Lei 7.713/1988, art. 6º, V; Súmula 386 do STJ", descricao: "Isenção de IR sobre indenizações rescisórias e férias indenizadas." },
    ],
  };
}
