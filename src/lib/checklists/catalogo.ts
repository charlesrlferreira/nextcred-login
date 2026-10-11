/**
 * Catálogo de checklists. Cada modelo vira uma cópia por cliente, onde os passos são marcados.
 * O índice do passo é a identidade usada para salvar o andamento: ao editar um modelo,
 * acrescente passos ao final para não deslocar o andamento de cópias já criadas.
 */

export type Passo = {
  titulo: string;
  detalhe?: string;
  prazo?: string;
  documentos?: string[];
  baseLegal?: string;
};

export type AreaChecklist =
  | "Societário"
  | "Fiscal"
  | "Departamento Pessoal"
  | "Contábil"
  | "Imposto de Renda"
  | "Condomínios"
  | "Terceirização";

export type ModeloChecklist = {
  slug: string;
  titulo: string;
  area: AreaChecklist;
  descricao: string;
  passos: Passo[];
};

export const AREAS_CHECKLIST: AreaChecklist[] = [
  "Societário",
  "Fiscal",
  "Departamento Pessoal",
  "Contábil",
  "Imposto de Renda",
  "Condomínios",
  "Terceirização",
];

export const CHECKLISTS: ModeloChecklist[] = [
  /* ---------------- Societário ---------------- */
  {
    slug: "abertura-ltda-simples",
    titulo: "Abertura de LTDA no Simples Nacional",
    area: "Societário",
    descricao: "Da consulta de viabilidade à opção pelo Simples, para sociedade limitada.",
    passos: [
      {
        titulo: "Levantar dados dos sócios e do negócio",
        detalhe: "Atividades pretendidas, endereço, capital social, participação de cada sócio, administrador e regime de bens dos sócios casados.",
        documentos: ["RG/CNH e CPF dos sócios", "Comprovante de residência", "Certidão de casamento, se houver", "IPTU ou contrato de locação do endereço"],
      },
      {
        titulo: "Definir CNAEs e conferir enquadramento no Simples",
        detalhe: "Confirme se as atividades são permitidas no Simples e se estão sujeitas ao Fator R (Anexo III ou V).",
        baseLegal: "LC 123/2006, arts. 17 e 18; Resolução CGSN 140/2018, Anexo VI",
      },
      {
        titulo: "Consulta de viabilidade na prefeitura e Junta Comercial",
        detalhe: "Pesquisa de nome empresarial e viabilidade de endereço para as atividades escolhidas.",
        prazo: "Antes do registro",
      },
      {
        titulo: "Preencher o DBE na Receita Federal (Redesim)",
        detalhe: "Documento Básico de Entrada com os dados cadastrais do CNPJ.",
      },
      {
        titulo: "Elaborar e assinar o contrato social",
        detalhe: "Assinatura digital (gov.br ou certificado ICP-Brasil) de todos os sócios.",
        baseLegal: "Código Civil, arts. 997 e 1.052 a 1.087",
      },
      {
        titulo: "Registrar na Junta Comercial e obter o CNPJ",
        detalhe: "Pagamento das taxas e acompanhamento das exigências.",
        documentos: ["Contrato social assinado", "DBE", "Comprovante de pagamento do DARE/taxa"],
      },
      {
        titulo: "Inscrição municipal e alvará de funcionamento",
        detalhe: "Atividades de baixo risco podem ser dispensadas de alvará, conforme legislação local.",
        baseLegal: "Lei 13.874/2019 (Liberdade Econômica), art. 3º, I",
      },
      { titulo: "Inscrição estadual, se houver comércio ou indústria" },
      {
        titulo: "Solicitar a opção pelo Simples Nacional",
        prazo: "Até 30 dias do deferimento da última inscrição (municipal ou estadual), dentro do limite contado da abertura do CNPJ",
        baseLegal: "LC 123/2006, art. 16; Resolução CGSN 140/2018, art. 6º",
      },
      { titulo: "Cadastrar no eSocial e emitir certificado digital da empresa" },
      { titulo: "Abrir conta bancária PJ e integralizar o capital social" },
      { titulo: "Configurar emissão de notas fiscais e entregar o kit de boas-vindas ao cliente" },
    ],
  },
  {
    slug: "alteracao-contratual",
    titulo: "Alteração contratual",
    area: "Societário",
    descricao: "Mudança de endereço, sócios, capital, atividade ou administração.",
    passos: [
      { titulo: "Identificar o que muda e os impactos tributários e cadastrais" },
      { titulo: "Consulta de viabilidade, se mudar endereço ou atividade" },
      {
        titulo: "Redigir a alteração contratual (ou consolidação)",
        baseLegal: "Código Civil, arts. 999 e 1.071 a 1.076",
      },
      { titulo: "Colher assinaturas dos sócios" },
      { titulo: "Preencher o DBE da alteração na Redesim" },
      { titulo: "Protocolar na Junta Comercial e acompanhar exigências", prazo: "Até 30 dias da assinatura para retroagir à data do ato", baseLegal: "Lei 8.934/1994, art. 36" },
      { titulo: "Atualizar inscrição municipal, estadual e alvarás" },
      { titulo: "Conferir reflexos no Simples (CNAE, sócios em outras empresas)" },
      { titulo: "Atualizar cadastros em bancos, certificado digital e sistemas" },
    ],
  },
  {
    slug: "baixa-empresa",
    titulo: "Encerramento (baixa) de empresa",
    area: "Societário",
    descricao: "Distrato, declarações de encerramento e baixa nos órgãos.",
    passos: [
      { titulo: "Levantar pendências fiscais, trabalhistas e previdenciárias", documentos: ["Relatório de situação fiscal (e-CAC)", "Certidões estaduais e municipais"] },
      { titulo: "Encerrar contratos de trabalho e enviar eventos do eSocial", baseLegal: "CLT, art. 477" },
      { titulo: "Apurar e pagar os tributos até a data do encerramento" },
      { titulo: "Elaborar balanço de encerramento e distribuir o patrimônio" },
      { titulo: "Redigir e assinar o distrato social", baseLegal: "Código Civil, arts. 1.033 e 1.102 a 1.112" },
      { titulo: "Registrar o distrato na Junta Comercial (baixa integrada pela Redesim)", baseLegal: "LC 123/2006, art. 9º" },
      { titulo: "Entregar declarações de situação especial (DEFIS, ECF, ECD, conforme regime)" },
      { titulo: "Baixar inscrições municipal e estadual e cancelar notas e equipamentos fiscais" },
      { titulo: "Guardar os livros e documentos pelo prazo legal", baseLegal: "CTN, arts. 173 e 195, parágrafo único" },
    ],
  },

  /* ---------------- Fiscal ---------------- */
  {
    slug: "fechamento-simples",
    titulo: "Fechamento mensal — Simples Nacional",
    area: "Fiscal",
    descricao: "Rotina do mês para empresas do Simples: notas, PGDAS-D e DAS.",
    passos: [
      { titulo: "Receber notas emitidas e recebidas, extratos e relatórios de venda", prazo: "Até o dia 5 do mês seguinte (combinar com o cliente)" },
      { titulo: "Conferir as notas emitidas com o faturamento informado" },
      { titulo: "Segregar receitas por anexo, ST, monofásicos e retenções de ISS", detalhe: "Segregar corretamente evita pagar duas vezes tributos já recolhidos por substituição.", baseLegal: "LC 123/2006, art. 18, § 4º-A" },
      { titulo: "Calcular o Fator R, se aplicável", baseLegal: "LC 123/2006, art. 18, § 5º-J" },
      { titulo: "Apurar no PGDAS-D e emitir o DAS", prazo: "Até o dia 20 do mês seguinte", baseLegal: "LC 123/2006, art. 21, III" },
      { titulo: "Conferir limite e sublimite de receita no ano" },
      { titulo: "Enviar o DAS e o resumo do mês ao cliente" },
      { titulo: "Arquivar o recibo da apuração e o comprovante de pagamento" },
    ],
  },
  {
    slug: "fechamento-presumido",
    titulo: "Fechamento mensal — Lucro Presumido",
    area: "Fiscal",
    descricao: "PIS/Cofins mensais, IRPJ/CSLL trimestrais, ISS/ICMS e obrigações acessórias.",
    passos: [
      { titulo: "Receber e conferir notas fiscais e extratos" },
      { titulo: "Escriturar entradas e saídas no sistema fiscal" },
      { titulo: "Apurar PIS (0,65%) e Cofins (3%) cumulativos", prazo: "DARF até o dia 25 do mês seguinte", baseLegal: "Lei 9.718/1998" },
      { titulo: "Apurar ISS e/ou ICMS conforme legislação local" },
      { titulo: "Apurar retenções na fonte (IRRF, CSRF, INSS) e enviar a EFD-Reinf", baseLegal: "IN RFB 2.043/2021" },
      { titulo: "Nos meses de fechamento de trimestre: apurar IRPJ e CSLL", prazo: "Último dia útil do mês seguinte ao trimestre (cota única ou 1ª quota)", baseLegal: "Lei 9.430/1996, arts. 1º, 5º e 25" },
      { titulo: "Transmitir a DCTFWeb e a EFD-Contribuições no prazo" },
      { titulo: "Enviar guias e relatório do mês ao cliente" },
    ],
  },

  /* ---------------- Departamento Pessoal ---------------- */
  {
    slug: "admissao-clt",
    titulo: "Admissão de empregado CLT",
    area: "Departamento Pessoal",
    descricao: "Documentos, exame admissional, contrato e eSocial.",
    passos: [
      { titulo: "Receber documentos do empregado", documentos: ["CPF e documento com foto", "Carteira de Trabalho Digital", "Comprovante de residência", "Certidão de nascimento dos filhos (salário-família)", "Dados bancários", "Comprovante de escolaridade"] },
      { titulo: "Realizar o exame médico admissional (ASO)", prazo: "Antes do início das atividades", baseLegal: "CLT, art. 168; NR-7" },
      { titulo: "Definir cargo, CBO, salário, jornada e convenção coletiva aplicável" },
      { titulo: "Elaborar contrato de trabalho (e de experiência, se houver)", baseLegal: "CLT, arts. 442 a 445" },
      { titulo: "Enviar o evento S-2200 ao eSocial", prazo: "Até o dia anterior ao início das atividades", baseLegal: "Manual de Orientação do eSocial" },
      { titulo: "Colher opção ou recusa de vale-transporte", baseLegal: "Lei 7.418/1985" },
      { titulo: "Cadastrar dependentes para IR e salário-família" },
      { titulo: "Entregar cópia do contrato e regulamento interno ao empregado" },
    ],
  },
  {
    slug: "folha-mensal",
    titulo: "Fechamento da folha de pagamento",
    area: "Departamento Pessoal",
    descricao: "Do recebimento das variáveis às guias de FGTS, INSS e IRRF.",
    passos: [
      { titulo: "Receber variáveis do mês (horas extras, faltas, comissões, admissões e desligamentos)" },
      { titulo: "Calcular a folha, férias e rescisões do período" },
      { titulo: "Pagar os salários", prazo: "Até o 5º dia útil do mês seguinte", baseLegal: "CLT, art. 459, § 1º" },
      { titulo: "Enviar eventos periódicos ao eSocial (S-1200, S-1210) e fechar o período (S-1299)", prazo: "Até o dia 15 do mês seguinte" },
      { titulo: "Emitir a guia do FGTS Digital", prazo: "Até o dia 20 do mês seguinte", baseLegal: "Lei 8.036/1990, art. 15 (redação da Lei 14.438/2022)" },
      { titulo: "Transmitir a DCTFWeb e emitir o DARF de INSS e IRRF", prazo: "Vencimento no dia 20 do mês seguinte" },
      { titulo: "Enviar holerites, guias e resumo ao cliente" },
    ],
  },
  {
    slug: "rescisao-contrato",
    titulo: "Rescisão de contrato de trabalho",
    area: "Departamento Pessoal",
    descricao: "Do aviso prévio ao pagamento e à liberação do FGTS e seguro-desemprego.",
    passos: [
      { titulo: "Confirmar tipo de desligamento, data e forma do aviso prévio", baseLegal: "CLT, arts. 482, 483, 484-A e 487" },
      { titulo: "Realizar o exame demissional, se exigido", baseLegal: "NR-7" },
      { titulo: "Calcular as verbas rescisórias (use a Calculadora de Rescisão)" },
      { titulo: "Enviar o evento S-2299 ao eSocial", prazo: "Até 10 dias após o desligamento" },
      { titulo: "Pagar as verbas e entregar os documentos", prazo: "Até 10 dias corridos após o término do contrato", baseLegal: "CLT, art. 477, § 6º" },
      { titulo: "Recolher o FGTS rescisório e a multa no FGTS Digital" },
      { titulo: "Dar baixa na Carteira de Trabalho Digital (automática via eSocial) e liberar seguro-desemprego, quando cabível" },
      { titulo: "Arquivar TRCT assinado e comprovantes" },
    ],
  },

  /* ---------------- Contábil ---------------- */
  {
    slug: "fechamento-contabil",
    titulo: "Fechamento contábil mensal",
    area: "Contábil",
    descricao: "Conciliações, provisões e balancete para análise.",
    passos: [
      { titulo: "Importar e classificar extratos bancários" },
      { titulo: "Conciliar bancos, aplicações e caixa" },
      { titulo: "Contabilizar notas de entrada e saída integradas do fiscal" },
      { titulo: "Integrar folha de pagamento e encargos" },
      { titulo: "Lançar depreciação e provisões (férias, 13º)", baseLegal: "NBC TG 27 e NBC TG 25" },
      { titulo: "Conciliar clientes, fornecedores e tributos a recolher" },
      { titulo: "Emitir e revisar o balancete, analisando variações relevantes" },
      { titulo: "Enviar relatório gerencial ao cliente" },
    ],
  },
  {
    slug: "encerramento-exercicio",
    titulo: "Encerramento do exercício",
    area: "Contábil",
    descricao: "Inventário, demonstrações, ECD e ECF.",
    passos: [
      { titulo: "Solicitar inventário de estoques e posição de imobilizado em 31/12" },
      { titulo: "Revisar todas as conciliações do ano" },
      { titulo: "Apurar o resultado e destinar os lucros", baseLegal: "Lei 6.404/1976, arts. 176 a 192 (aplicação subsidiária)" },
      { titulo: "Elaborar balanço patrimonial, DRE e notas explicativas", baseLegal: "NBC TG 1000 / ITG 1000, conforme porte" },
      { titulo: "Colher assinatura dos administradores nas demonstrações" },
      { titulo: "Transmitir a ECD", prazo: "Até o último dia útil de junho", baseLegal: "IN RFB 2.003/2021" },
      { titulo: "Transmitir a ECF", prazo: "Até o último dia útil de julho", baseLegal: "IN RFB 2.004/2021" },
      { titulo: "Entregar ao cliente os informes de distribuição de lucros aos sócios" },
    ],
  },

  /* ---------------- Imposto de Renda ---------------- */
  {
    slug: "irpf-documentos",
    titulo: "IRPF — documentos e entrega da declaração",
    area: "Imposto de Renda",
    descricao: "Lista de documentos do cliente pessoa física e etapas até o recibo.",
    passos: [
      { titulo: "Baixar a declaração pré-preenchida e a do ano anterior" },
      { titulo: "Receber informes de rendimentos", documentos: ["Informe do empregador (salários)", "Informes de bancos e corretoras", "Informe de previdência privada", "Recibos de aluguéis recebidos", "Informe de lucros e dividendos"] },
      { titulo: "Receber comprovantes de despesas dedutíveis", documentos: ["Despesas médicas e plano de saúde", "Despesas com instrução", "Pensão alimentícia judicial", "Carnê-leão pago"], baseLegal: "Lei 9.250/1995, art. 8º" },
      { titulo: "Atualizar bens e direitos e dívidas" },
      { titulo: "Conferir rendimentos isentos, tributação exclusiva e ganhos de capital" },
      { titulo: "Comparar modelo completo e simplificado" },
      { titulo: "Transmitir a declaração e enviar recibo e DARF ao cliente", prazo: "Conforme instrução normativa do ano (normalmente até 31 de maio)" },
    ],
  },

  /* ---------------- Condomínios ---------------- */
  {
    slug: "assembleia-ordinaria-condominio",
    titulo: "Assembleia geral ordinária de condomínio",
    area: "Condomínios",
    descricao: "Prestação de contas anual, orçamento e eleição de síndico.",
    passos: [
      { titulo: "Preparar a prestação de contas do exercício e o parecer do conselho fiscal", baseLegal: "Código Civil, art. 1.348, VIII, e art. 1.356" },
      { titulo: "Elaborar a previsão orçamentária e o rateio do próximo período", baseLegal: "Código Civil, art. 1.350" },
      { titulo: "Emitir e enviar o edital de convocação a todos os condôminos", detalhe: "Use o modelo de edital de convocação. Observe a antecedência prevista na convenção.", baseLegal: "Código Civil, art. 1.354" },
      { titulo: "Preparar lista de presença, procurações e relação de inadimplentes", baseLegal: "Código Civil, art. 1.335, III" },
      { titulo: "Conduzir a assembleia e apurar os quóruns de cada deliberação", baseLegal: "Código Civil, arts. 1.352 e 1.353" },
      { titulo: "Lavrar a ata e colher assinaturas do presidente e secretário" },
      { titulo: "Registrar a ata em cartório, se houver eleição de síndico" },
      { titulo: "Enviar a ata aos condôminos e atualizar cadastros bancários e na Receita" },
    ],
  },
  {
    slug: "prestacao-contas-condominio",
    titulo: "Prestação de contas mensal do condomínio",
    area: "Condomínios",
    descricao: "Fechamento do mês, pasta de contas e envio aos condôminos.",
    passos: [
      { titulo: "Conciliar a conta bancária e o fundo de reserva" },
      { titulo: "Conferir boletos emitidos, recebidos e inadimplência por unidade" },
      { titulo: "Lançar despesas com comprovantes e notas fiscais" },
      { titulo: "Reter e recolher tributos de serviços tomados (INSS, IR, CSRF, ISS)", baseLegal: "Lei 8.212/1991, art. 31; Lei 10.833/2003, art. 30" },
      { titulo: "Fechar a folha dos funcionários do condomínio, se houver" },
      { titulo: "Montar o balancete e a pasta de prestação de contas" },
      { titulo: "Submeter ao conselho fiscal e ao síndico" },
      { titulo: "Disponibilizar a prestação de contas aos condôminos" },
    ],
  },
  {
    slug: "posse-sindico",
    titulo: "Posse de novo síndico",
    area: "Condomínios",
    descricao: "Transição de gestão após a eleição.",
    passos: [
      { titulo: "Registrar a ata de eleição em cartório" },
      { titulo: "Atualizar o responsável no CNPJ do condomínio (Redesim)" },
      { titulo: "Atualizar representantes nos bancos e certificados digitais" },
      { titulo: "Receber do síndico anterior documentos, contratos, chaves e senhas" },
      { titulo: "Levantar contratos vigentes, seguros e manutenções obrigatórias", baseLegal: "Código Civil, art. 1.346 (seguro obrigatório)" },
      { titulo: "Apresentar o novo síndico a funcionários e prestadores" },
    ],
  },

  /* ---------------- Terceirização ---------------- */
  {
    slug: "implantacao-posto-terceirizado",
    titulo: "Implantação de posto terceirizado",
    area: "Terceirização",
    descricao: "Contrato com o tomador, equipe, documentação e retenções.",
    passos: [
      { titulo: "Calcular o custo do posto e a proposta comercial" },
      { titulo: "Assinar o contrato de prestação de serviços com o tomador", baseLegal: "Lei 6.019/1974, arts. 4º-A, 4º-B e 5º-B" },
      { titulo: "Conferir capital social mínimo compatível com o número de empregados", baseLegal: "Lei 6.019/1974, art. 4º-B, III" },
      { titulo: "Admitir a equipe (use o checklist de admissão CLT)" },
      { titulo: "Entregar uniformes e EPIs com ficha de entrega assinada", baseLegal: "NR-6" },
      { titulo: "Integrar a equipe às normas de segurança do tomador", baseLegal: "Lei 6.019/1974, art. 5º-A, § 3º" },
      { titulo: "Configurar a nota fiscal com destaque da retenção de 11% de INSS", baseLegal: "Lei 8.212/1991, art. 31" },
      { titulo: "Definir rotina mensal de envio de documentos ao tomador (folha, FGTS, INSS)" },
    ],
  },
];

export function buscarChecklist(slug: string): ModeloChecklist | undefined {
  return CHECKLISTS.find((c) => c.slug === slug);
}
