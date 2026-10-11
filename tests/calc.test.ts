import { describe, expect, it } from "vitest";
import { calcularInss, calcularIrrf } from "@/lib/calc/inss-irrf";
import { avos13, avosFerias, calcularRescisao, diasAvisoProporcional, diasSaldoSalario } from "@/lib/calc/rescisao";
import { aliquotaEfetiva, calcularDas, calcularFatorR } from "@/lib/calc/simples";
import { calcular13, calcularFerias } from "@/lib/calc/ferias-13";
import { compararProLabore, compararRegimes } from "@/lib/calc/regimes";
import { calcularMultasJuros, precificarHonorarios } from "@/lib/calc/escritorio";
import { parseData } from "@/lib/calc/util";

const verba = (r: ReturnType<typeof calcularRescisao>, nome: string) =>
  r.tabelas[0].linhas.find((l) => l[0] === nome)?.[2];

describe("INSS", () => {
  it("calcula progressivo por faixa", () => {
    expect(calcularInss(3000).total).toBe(248.6);
    expect(calcularInss(6000).total).toBe(641.51);
  });
  it("limita ao teto", () => {
    expect(calcularInss(10000).total).toBe(988.09);
    expect(calcularInss(20000).total).toBe(988.09);
  });
});

describe("IRRF 2026", () => {
  it("zera o imposto até R$ 5.000 com o redutor", () => {
    expect(calcularIrrf(5000, calcularInss(5000).total).imposto).toBe(0);
    expect(calcularIrrf(3000, 248.6).imposto).toBe(0);
  });
  it("aplica redução parcial entre R$ 5.000 e R$ 7.350", () => {
    const d = calcularIrrf(6000, 641.51);
    expect(d.usouSimplificado).toBe(false);
    expect(d.base).toBe(5358.49);
    expect(d.redutor).toBe(179.75);
    expect(d.imposto).toBe(r(d.impostoTabela - 179.75));
  });
  it("sem redutor acima de R$ 7.350", () => {
    const d = calcularIrrf(10000, 988.09);
    expect(d.redutor).toBe(0);
    expect(d.imposto).toBe(r((10000 - 988.09) * 0.275 - 908.73));
  });
});

function r(v: number) {
  return Math.round(v * 100) / 100;
}

describe("Simples Nacional", () => {
  it("alíquota efetiva do Anexo III na 3ª faixa", () => {
    const a = aliquotaEfetiva("III", 500000);
    expect(a.faixa).toBe(3);
    expect(a.efetiva).toBeCloseTo(0.09972, 6);
    expect(calcularDas({ anexo: "III", rbt12: 500000, receitaMes: 50000 }).destaques[0].valor).toBe(4986);
  });
  it("acima do limite usa a última faixa", () => {
    expect(aliquotaEfetiva("I", 5000000).faixa).toBe(6);
  });
  it("Fator R define o anexo", () => {
    const iii = calcularFatorR({ folha12: 140000, rbt12: 500000, receitaMes: 40000 });
    expect(iii.destaques[1].valor).toBe("Anexo III");
    const v = calcularFatorR({ folha12: 100000, rbt12: 500000, receitaMes: 40000 });
    expect(v.destaques[1].valor).toBe("Anexo V");
  });
});

describe("Rescisão", () => {
  it("contagem de prazos", () => {
    expect(diasAvisoProporcional(parseData("2023-03-10"), parseData("2025-08-20"))).toBe(36);
    expect(avos13(parseData("2023-03-10"), parseData("2025-09-25"))).toBe(9);
    expect(avosFerias(parseData("2025-03-10"), parseData("2025-09-25"))).toBe(7);
    expect(avosFerias(parseData("2025-01-01"), parseData("2025-12-31"))).toBe(12);
    expect(diasSaldoSalario(parseData("2020-01-01"), parseData("2025-02-28"))).toBe(30);
    expect(diasSaldoSalario(parseData("2025-02-10"), parseData("2025-02-20"))).toBe(11);
  });

  const base = {
    salario: 3000,
    mediaVariaveis: 0,
    dataAdmissao: "2023-03-10",
    dataSaida: "2025-08-20",
    aviso: "indenizado" as const,
    feriasVencidas: 0,
    feriasEmDobro: 0,
    saldoFgts: 10000,
    dependentes: 0,
  };

  it("dispensa sem justa causa com aviso indenizado", () => {
    const res = calcularRescisao({ ...base, tipo: "sem_justa_causa" });
    expect(verba(res, "Saldo de salário")).toBe("R$ 2.000,00");
    expect(verba(res, "Aviso prévio indenizado")).toBe("R$ 3.600,00");
    expect(verba(res, "13º salário proporcional")).toBe("R$ 2.250,00");
    expect(verba(res, "Férias proporcionais")).toBe("R$ 1.750,00");
    expect(verba(res, "1/3 sobre férias proporcionais")).toBe("R$ 583,33");
    // FGTS: 8% × (2000 + 3600 + 2250) = 628; multa 40% × 10628
    expect(res.destaques[3].valor).toBe(4251.2);
  });

  it("justa causa não paga proporcionais", () => {
    const res = calcularRescisao({ ...base, tipo: "justa_causa", feriasVencidas: 1 });
    expect(verba(res, "13º salário proporcional")).toBeUndefined();
    expect(verba(res, "Férias proporcionais")).toBeUndefined();
    expect(verba(res, "Férias vencidas")).toBe("R$ 3.000,00");
    expect(res.destaques[3].valor).toBe(0);
  });

  it("acordo paga metade do aviso e multa de 20%", () => {
    const res = calcularRescisao({ ...base, tipo: "acordo" });
    expect(verba(res, "Aviso prévio indenizado")).toBe("R$ 1.800,00");
  });

  it("pedido de demissão sem cumprir aviso desconta 30 dias", () => {
    const res = calcularRescisao({ ...base, tipo: "pedido_demissao", aviso: "nao_cumprido" });
    expect(res.tabelas[1].linhas.some((l) => l[0].startsWith("Aviso prévio não cumprido") && l[1] === "R$ 3.000,00")).toBe(true);
  });

  it("rejeita saída antes da admissão", () => {
    expect(() => calcularRescisao({ ...base, tipo: "sem_justa_causa", dataSaida: "2020-01-01" })).toThrow();
  });
});

describe("Férias e 13º", () => {
  it("férias com abono", () => {
    const res = calcularFerias({ salario: 3000, mediaVariaveis: 0, faltas: 0, abonoPecuniario: true, dependentes: 0 });
    expect(res.destaques[1].valor).toBe(20);
    expect(res.tabelas[0].linhas[0][2]).toBe("R$ 2.000,00");
  });
  it("faltas reduzem os dias", () => {
    const res = calcularFerias({ salario: 3000, mediaVariaveis: 0, faltas: 10, abonoPecuniario: false, dependentes: 0 });
    expect(res.destaques[1].valor).toBe(24);
  });
  it("13º primeira parcela sem descontos", () => {
    const res = calcular13({ salario: 3000, mediaVariaveis: 0, avos: 12, parcela: "primeira", adiantamentoPago: 0, dependentes: 0 });
    expect(res.destaques[0].valor).toBe(1500);
  });
  it("13º segunda parcela desconta INSS e adiantamento", () => {
    const res = calcular13({ salario: 3000, mediaVariaveis: 0, avos: 12, parcela: "segunda", adiantamentoPago: 0, dependentes: 0 });
    expect(res.destaques[0].valor).toBe(r(3000 - 248.6 - 1500));
  });
});

describe("Tributário", () => {
  it("comparador escolhe um regime aplicável", () => {
    const res = compararRegimes({
      atividade: "comercio",
      faturamentoAnual: 6000000,
      folhaAnual: 600000,
      custosDespesas: 4000000,
      comprasComCredito: 3500000,
      aliquotaIssIcms: 3,
      encargosPatronais: 27.8,
    });
    expect(res.destaques[0].valor).not.toBe("Simples Nacional");
  });
  it("pró-labore x lucros no Simples", () => {
    const res = compararProLabore({ regime: "simples", retiradaMensal: 10000, dependentes: 0 });
    expect(Number(res.destaques[0].valor)).toBeGreaterThan(0);
  });
  it("multa limitada a 20% e juros Selic + 1%", () => {
    const res = calcularMultasJuros({ principal: 1000, vencimento: "2026-01-20", pagamento: "2026-06-10", selicAcumulada: 4 });
    expect(res.destaques[1].valor).toBe(200);
    expect(res.destaques[2].valor).toBe(50);
  });
  it("honorários cobrem custo, tributos e margem", () => {
    const res = precificarHonorarios({
      custosFixosMensais: 35200,
      horasProdutivasMes: 352,
      regime: "simples",
      funcionarios: 0,
      notasMes: 0,
      horasExtras: 0,
      complexidade: "baixa",
      tributosHonorarios: 6,
      margem: 24,
    });
    // 6 h × R$ 100 = 600 ÷ 0,70
    expect(res.destaques[0].valor).toBe(857.14);
  });
});
