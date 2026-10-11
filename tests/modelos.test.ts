import { describe, expect, it } from "vitest";
import { CHECKLISTS } from "@/lib/checklists/catalogo";
import type { Campo } from "@/lib/campos";
import { validarEntrada } from "@/lib/ferramentas/entrada";
import { dataExtenso } from "@/lib/modelos/formato";
import { MODELOS } from "@/lib/modelos/catalogo";
import type { Documento } from "@/lib/modelos/tipos";

const escritorio = {
  nome: "Tag Brasil Contabilidade",
  cnpj: "12.345.678/0001-90",
  crc: "SP-123456/O",
  responsavel: "Charles Ferreira",
  endereco: "Rua A, 100, São Paulo/SP",
  email: "contato@tag.com.br",
  telefone: "(11) 99999-0000",
};

function exemplo(c: Campo): string {
  if (c.padrao !== undefined) return String(c.padrao);
  switch (c.tipo) {
    case "moeda":
      return "1.850,00";
    case "percentual":
      return "4,5";
    case "inteiro":
    case "numero":
      return "10";
    case "data":
      return "2026-10-11";
    case "selecao":
      return c.opcoes![0].valor;
    case "sim_nao":
      return "true";
    default:
      return `Texto de ${c.nome}`;
  }
}

const texto = (d: Documento) => JSON.stringify(d);

describe("modelos de documentos", () => {
  it("slugs únicos", () => {
    expect(new Set(MODELOS.map((m) => m.slug)).size).toBe(MODELOS.length);
  });

  it.each(MODELOS.map((m) => [m.slug, m] as const))("%s gera documento completo", (_, modelo) => {
    const bruto = Object.fromEntries(modelo.campos.map((c) => [c.nome, exemplo(c)]));
    const v = validarEntrada(modelo, bruto);
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    const doc = modelo.gerar({ escritorio, v: v.valores });
    const t = texto(doc);
    expect(t).not.toMatch(/undefined|NaN|\[object/);
    expect(doc.blocos.length).toBeGreaterThan(2);
    expect(modelo.titulo(v.valores)).not.toMatch(/undefined/);
  });

  it.each(MODELOS.map((m) => [m.slug, m] as const))("%s tolera campos vazios na prévia", (_, modelo) => {
    const doc = modelo.gerar({ escritorio, v: {} });
    expect(texto(doc)).not.toMatch(/undefined|NaN/);
  });

  it("valor por extenso no contrato", () => {
    const modelo = MODELOS.find((m) => m.slug === "contrato-servicos-contabeis")!;
    const bruto = Object.fromEntries(modelo.campos.map((c) => [c.nome, exemplo(c)]));
    const v = validarEntrada(modelo, bruto);
    if (!v.ok) throw new Error("inválido");
    expect(texto(modelo.gerar({ escritorio, v: v.valores }))).toContain("R$ 1.850,00 (mil oitocentos e cinquenta reais)");
  });

  it("reajuste calcula o novo valor", () => {
    const modelo = MODELOS.find((m) => m.slug === "comunicado-reajuste")!;
    const doc = modelo.gerar({ escritorio, v: { clienteNome: "X", valorAtual: 1000, percentual: 4.5, indice: "IPCA", aPartirDe: "janeiro" } });
    expect(texto(doc)).toContain("R$ 1.045,00");
    expect(texto(doc)).toContain("4,5%");
  });

  it("data por extenso", () => {
    expect(dataExtenso("2026-10-01")).toBe("1º de outubro de 2026");
    expect(dataExtenso("2026-12-25")).toBe("25 de dezembro de 2026");
  });
});

describe("checklists", () => {
  it("slugs únicos e passos preenchidos", () => {
    expect(new Set(CHECKLISTS.map((c) => c.slug)).size).toBe(CHECKLISTS.length);
    for (const c of CHECKLISTS) {
      expect(c.passos.length).toBeGreaterThanOrEqual(5);
      for (const p of c.passos) expect(p.titulo.length).toBeGreaterThan(5);
    }
  });
});
