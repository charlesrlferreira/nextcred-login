/** Estrutura comum de resultado de todas as ferramentas. */

export type Formato = "moeda" | "percentual" | "numero" | "texto" | "data";

export type Destaque = {
  rotulo: string;
  valor: number | string;
  formato: Formato;
  /** Realça o cartão principal do resultado. */
  principal?: boolean;
  tom?: "positivo" | "negativo" | "neutro";
};

export type Tabela = {
  titulo: string;
  colunas: string[];
  /** Células já formatadas. A primeira coluna fica à esquerda; as demais à direita. */
  linhas: string[][];
  /** Linha de total, exibida em negrito ao final. */
  total?: string[];
};

export type BaseLegal = { norma: string; descricao: string };

export type Resultado = {
  destaques: Destaque[];
  tabelas: Tabela[];
  memoria: string[];
  alertas: string[];
  baseLegal: BaseLegal[];
};
