import type { Campo } from "../campos";

export type Bloco =
  | { tipo: "titulo"; texto: string }
  | { tipo: "paragrafo"; texto: string }
  | { tipo: "clausula"; titulo: string; paragrafos: string[] }
  | { tipo: "lista"; itens: string[] }
  | { tipo: "local_data"; texto: string }
  | { tipo: "assinaturas"; partes: { nome: string; qualificacao?: string }[] };

export type Documento = { titulo: string; blocos: Bloco[] };

export type DadosEscritorio = {
  nome: string;
  cnpj: string | null;
  crc: string | null;
  responsavel: string | null;
  endereco: string | null;
  email: string | null;
  telefone: string | null;
};

export type ContextoModelo = {
  escritorio: DadosEscritorio;
  /** Valores já validados dos campos do modelo. */
  v: Record<string, unknown>;
};

export type CategoriaModelo = "Contratos e propostas" | "Comunicados e notificações" | "Procurações e declarações" | "Condomínios";

export type ModeloDocumento = {
  slug: string;
  nome: string;
  categoria: CategoriaModelo;
  resumo: string;
  campos: Campo[];
  titulo: (v: Record<string, unknown>) => string;
  gerar: (ctx: ContextoModelo) => Documento;
};
