/** Definição de campos de formulário, compartilhada por ferramentas e modelos de documentos. */

export type TipoCampo =
  | "moeda"
  | "numero"
  | "inteiro"
  | "percentual"
  | "data"
  | "selecao"
  | "sim_nao"
  | "texto"
  | "texto_longo";

export type Campo = {
  nome: string;
  rotulo: string;
  tipo: TipoCampo;
  ajuda?: string;
  padrao?: string | number | boolean;
  opcional?: boolean;
  min?: number;
  max?: number;
  opcoes?: { valor: string; rotulo: string }[];
  /** Exibe o campo só quando outro campo tem um destes valores. */
  mostrarSe?: { campo: string; valores: string[] };
  /** Preenche automaticamente com um dado do cliente escolhido. */
  preencherDe?: "cliente.nome" | "cliente.documento" | "cliente.email";
  /** Agrupa campos em seções no formulário. */
  secao?: string;
};
