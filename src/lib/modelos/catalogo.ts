import type { Campo } from "../campos";
import { data, localData, moedaExtenso, paragrafos, percentual, qualificacaoEscritorio, txt } from "./formato";
import type { CategoriaModelo, ModeloDocumento } from "./tipos";

/* ---------- Campos reutilizados ---------- */

const cliente = (rotulo = "Cliente"): Campo[] => [
  { nome: "clienteNome", rotulo: `${rotulo}: nome ou razão social`, tipo: "texto", preencherDe: "cliente.nome", secao: rotulo },
  { nome: "clienteDocumento", rotulo: "CNPJ ou CPF", tipo: "texto", preencherDe: "cliente.documento", secao: rotulo },
  { nome: "clienteEndereco", rotulo: "Endereço completo", tipo: "texto", opcional: true, secao: rotulo },
  { nome: "clienteRepresentante", rotulo: "Representante legal (nome e cargo)", tipo: "texto", opcional: true, secao: rotulo },
];

const localEData: Campo[] = [
  { nome: "cidade", rotulo: "Cidade/UF da assinatura", tipo: "texto", secao: "Assinatura" },
  { nome: "dataDocumento", rotulo: "Data do documento", tipo: "data", opcional: true, ajuda: "Em branco, usa a data de hoje.", secao: "Assinatura" },
];

function qualificacaoCliente(v: Record<string, unknown>): string {
  const partes = [txt(v.clienteNome)];
  const doc = txt(v.clienteDocumento);
  if (doc) partes.push(`inscrito(a) no ${doc.replace(/\D/g, "").length > 11 ? "CNPJ" : "CPF"} sob o nº ${doc}`);
  if (v.clienteEndereco) partes.push(`com endereço em ${txt(v.clienteEndereco)}`);
  if (v.clienteRepresentante) partes.push(`neste ato representado(a) por ${txt(v.clienteRepresentante)}`);
  return partes.join(", ");
}

const assinaturaCliente = (v: Record<string, unknown>, papel: string) => ({
  nome: txt(v.clienteNome),
  qualificacao: [papel, txt(v.clienteRepresentante)].filter(Boolean).join(" — "),
});

/* ---------- Catálogo ---------- */

export const CATEGORIAS_MODELO: CategoriaModelo[] = [
  "Contratos e propostas",
  "Comunicados e notificações",
  "Procurações e declarações",
  "Condomínios",
];

export const MODELOS: ModeloDocumento[] = [
  {
    slug: "contrato-servicos-contabeis",
    nome: "Contrato de prestação de serviços contábeis",
    categoria: "Contratos e propostas",
    resumo: "Contrato completo com escopo, honorários, reajuste, responsabilidades e rescisão.",
    campos: [
      ...cliente("Contratante"),
      {
        nome: "escopo",
        rotulo: "Serviços contratados",
        tipo: "texto_longo",
        secao: "Serviços e valores",
        padrao:
          "Escrituração contábil e elaboração das demonstrações contábeis anuais\nEscrituração fiscal e apuração dos tributos mensais\nProcessamento da folha de pagamento, encargos e eSocial\nEntrega das obrigações acessórias federais, estaduais e municipais",
        ajuda: "Um serviço por linha.",
      },
      { nome: "honorario", rotulo: "Honorário mensal", tipo: "moeda", secao: "Serviços e valores" },
      { nome: "vencimento", rotulo: "Dia de vencimento", tipo: "inteiro", padrao: 10, min: 1, max: 31, secao: "Serviços e valores" },
      { nome: "inicio", rotulo: "Início da prestação", tipo: "data", secao: "Serviços e valores" },
      { nome: "indice", rotulo: "Índice de reajuste anual", tipo: "selecao", padrao: "IPCA", secao: "Serviços e valores", opcoes: [{ valor: "IPCA", rotulo: "IPCA" }, { valor: "INPC", rotulo: "INPC" }, { valor: "IGP-M", rotulo: "IGP-M" }] },
      { nome: "decimoTerceiro", rotulo: "Cobrar 13ª parcela em dezembro", tipo: "sim_nao", padrao: true, secao: "Serviços e valores", ajuda: "Remunera o encerramento do exercício e obrigações anuais." },
      { nome: "avisoPrevio", rotulo: "Aviso prévio para rescisão (dias)", tipo: "inteiro", padrao: 30, min: 0, max: 180, secao: "Serviços e valores" },
      { nome: "foro", rotulo: "Foro (comarca)", tipo: "texto", secao: "Serviços e valores" },
      ...localEData,
    ],
    titulo: (v) => `Contrato de serviços contábeis — ${txt(v.clienteNome)}`,
    gerar: ({ escritorio: e, v }) => ({
      titulo: "Contrato de Prestação de Serviços Contábeis",
      blocos: [
        {
          tipo: "paragrafo",
          texto: `Pelo presente instrumento particular, de um lado ${qualificacaoCliente(v)}, doravante denominado(a) CONTRATANTE, e de outro ${qualificacaoEscritorio(e)}${e.responsavel ? `, tendo como responsável técnico ${e.responsavel}` : ""}, doravante denominado CONTRATADO, ajustam o presente contrato, que se regerá pelas cláusulas seguintes.`,
        },
        {
          tipo: "clausula",
          titulo: "Do objeto",
          paragrafos: [
            "O CONTRATADO prestará à CONTRATANTE os seguintes serviços profissionais:",
            ...paragrafos(txt(v.escopo)).map((s, i) => `${String.fromCharCode(97 + i)}) ${s};`),
            "Serviços não relacionados acima, como alterações contratuais, certidões, declarações de imposto de renda dos sócios, consultorias e regularizações de períodos anteriores, serão orçados e cobrados à parte.",
          ],
        },
        {
          tipo: "clausula",
          titulo: "Das obrigações da contratante",
          paragrafos: [
            "Entregar ao CONTRATADO, até o dia 5 de cada mês, todos os documentos necessários à execução dos serviços, organizados e completos, respondendo pela veracidade e licitude das informações fornecidas.",
            "Comunicar com antecedência admissões, desligamentos, alterações salariais e qualquer fato que altere a rotina contábil, fiscal ou trabalhista.",
            "Responder pelas multas e encargos decorrentes de atraso na entrega de documentos ou no pagamento de tributos cujas guias tenham sido entregues no prazo.",
          ],
        },
        {
          tipo: "clausula",
          titulo: "Das obrigações do contratado",
          paragrafos: [
            "Executar os serviços com zelo, observando as Normas Brasileiras de Contabilidade e a legislação aplicável.",
            "Entregar guias de recolhimento e relatórios com antecedência mínima de 2 (dois) dias úteis do vencimento, desde que recebidos os documentos no prazo.",
            "Manter sigilo sobre as informações da CONTRATANTE e tratar os dados pessoais conforme a Lei 13.709/2018 (LGPD).",
          ],
        },
        {
          tipo: "clausula",
          titulo: "Dos honorários",
          paragrafos: [
            `Pelos serviços, a CONTRATANTE pagará ao CONTRATADO o honorário mensal de ${moedaExtenso(v.honorario)}, com vencimento no dia ${txt(v.vencimento)} de cada mês.`,
            ...(v.decimoTerceiro
              ? ["No mês de dezembro, será devida uma parcela adicional de igual valor, destinada a remunerar os serviços de encerramento do exercício e as obrigações anuais."]
              : []),
            `Os honorários serão reajustados anualmente pela variação acumulada do ${txt(v.indice)} dos últimos 12 meses, ou por outro índice que o substitua.`,
            "O atraso no pagamento sujeitará a CONTRATANTE a multa de 2% (dois por cento), juros de 1% (um por cento) ao mês e correção monetária, podendo o CONTRATADO suspender os serviços após 30 (trinta) dias de atraso, mediante aviso prévio.",
          ],
        },
        {
          tipo: "clausula",
          titulo: "Da vigência e da rescisão",
          paragrafos: [
            `Este contrato vigora por prazo indeterminado a partir de ${data(v.inicio)}.`,
            `Qualquer das partes poderá rescindi-lo mediante aviso prévio por escrito de ${txt(v.avisoPrevio)} dias, período em que os serviços e os honorários serão mantidos.`,
            "Na rescisão, o CONTRATADO entregará os documentos da CONTRATANTE e prestará as informações necessárias à transição para o novo profissional, mediante termo de transferência de responsabilidade técnica.",
          ],
        },
        {
          tipo: "clausula",
          titulo: "Do foro",
          paragrafos: [`Fica eleito o foro da comarca de ${txt(v.foro)} para dirimir quaisquer questões oriundas deste contrato.`],
        },
        { tipo: "paragrafo", texto: "E, por estarem de acordo, as partes assinam o presente em 2 (duas) vias de igual teor, ou eletronicamente." },
        { tipo: "local_data", texto: localData(v.cidade, v.dataDocumento) },
        {
          tipo: "assinaturas",
          partes: [assinaturaCliente(v, "Contratante"), { nome: e.nome, qualificacao: ["Contratado", e.responsavel, e.crc && `CRC ${e.crc}`].filter(Boolean).join(" — ") }],
        },
      ],
    }),
  },
  {
    slug: "proposta-honorarios",
    nome: "Proposta de honorários",
    categoria: "Contratos e propostas",
    resumo: "Proposta comercial com escopo, valor mensal, serviços extras e validade.",
    campos: [
      ...cliente("Destinatário"),
      { nome: "regime", rotulo: "Regime tributário do cliente", tipo: "texto", opcional: true, secao: "Proposta" },
      {
        nome: "escopo",
        rotulo: "Serviços incluídos",
        tipo: "texto_longo",
        secao: "Proposta",
        padrao: "Contabilidade e demonstrações anuais\nApuração de tributos e obrigações acessórias\nFolha de pagamento e eSocial\nAtendimento por WhatsApp e e-mail",
        ajuda: "Um serviço por linha.",
      },
      { nome: "honorario", rotulo: "Honorário mensal", tipo: "moeda", secao: "Proposta", ajuda: "Use a Precificação de Honorários para chegar ao valor." },
      { nome: "extras", rotulo: "Serviços cobrados à parte", tipo: "texto_longo", opcional: true, secao: "Proposta", padrao: "Alterações contratuais\nDeclaração de IRPF dos sócios\nRegularização de períodos anteriores" },
      { nome: "validade", rotulo: "Validade da proposta (dias)", tipo: "inteiro", padrao: 15, min: 1, max: 90, secao: "Proposta" },
      ...localEData,
    ],
    titulo: (v) => `Proposta de honorários — ${txt(v.clienteNome)}`,
    gerar: ({ escritorio: e, v }) => ({
      titulo: "Proposta de Prestação de Serviços Contábeis",
      blocos: [
        { tipo: "paragrafo", texto: `À ${qualificacaoCliente(v)}.` },
        {
          tipo: "paragrafo",
          texto: `Agradecemos a oportunidade e apresentamos nossa proposta de serviços contábeis${v.regime ? ` para empresa optante pelo ${txt(v.regime)}` : ""}.`,
        },
        { tipo: "titulo", texto: "Serviços incluídos" },
        { tipo: "lista", itens: paragrafos(txt(v.escopo)) },
        { tipo: "titulo", texto: "Investimento" },
        { tipo: "paragrafo", texto: `Honorário mensal de ${moedaExtenso(v.honorario)}, reajustado anualmente.` },
        ...(v.extras ? [{ tipo: "titulo" as const, texto: "Serviços cobrados à parte" }, { tipo: "lista" as const, itens: paragrafos(txt(v.extras)) }] : []),
        { tipo: "titulo", texto: "Condições" },
        {
          tipo: "lista",
          itens: [
            "Início dos serviços após assinatura do contrato e entrega da documentação.",
            "Documentos do mês entregues até o dia 5 do mês seguinte.",
            `Proposta válida por ${txt(v.validade)} dias.`,
          ],
        },
        { tipo: "paragrafo", texto: "Ficamos à disposição para esclarecimentos." },
        { tipo: "local_data", texto: localData(v.cidade, v.dataDocumento) },
        { tipo: "assinaturas", partes: [{ nome: e.responsavel || e.nome, qualificacao: [e.nome, e.crc && `CRC ${e.crc}`].filter(Boolean).join(" — ") }] },
      ],
    }),
  },
  {
    slug: "distrato-servicos-contabeis",
    nome: "Distrato e transferência de responsabilidade técnica",
    categoria: "Contratos e propostas",
    resumo: "Encerra o contrato e registra a entrega de documentos ao novo contador.",
    campos: [
      ...cliente("Contratante"),
      { nome: "dataContrato", rotulo: "Data do contrato original", tipo: "data", secao: "Distrato" },
      { nome: "dataEncerramento", rotulo: "Último mês de competência atendido", tipo: "texto", secao: "Distrato", ajuda: "Ex.: setembro de 2026." },
      { nome: "documentos", rotulo: "Documentos entregues", tipo: "texto_longo", secao: "Distrato", padrao: "Livros Diário e Razão\nArquivos da ECD e ECF\nBalancetes e demonstrações contábeis\nPastas da folha de pagamento\nSenhas e acessos a sistemas governamentais (a serem alterados pelo cliente)" },
      { nome: "pendencias", rotulo: "Pendências financeiras", tipo: "texto", opcional: true, secao: "Distrato", padrao: "Não há pendências financeiras entre as partes." },
      ...localEData,
    ],
    titulo: (v) => `Distrato — ${txt(v.clienteNome)}`,
    gerar: ({ escritorio: e, v }) => ({
      titulo: "Distrato de Prestação de Serviços Contábeis e Termo de Transferência de Responsabilidade Técnica",
      blocos: [
        {
          tipo: "paragrafo",
          texto: `${qualificacaoCliente(v)}, doravante CONTRATANTE, e ${qualificacaoEscritorio(e)}, doravante CONTRATADO, resolvem distratar o contrato de prestação de serviços contábeis celebrado em ${data(v.dataContrato)}, nos termos seguintes.`,
        },
        {
          tipo: "clausula",
          titulo: "Do encerramento",
          paragrafos: [`O CONTRATADO é responsável pelos serviços até a competência de ${txt(v.dataEncerramento)}, inclusive. A partir da competência seguinte, a responsabilidade técnica passa ao profissional indicado pela CONTRATANTE.`],
        },
        { tipo: "clausula", titulo: "Dos documentos entregues", paragrafos: ["Nesta data, o CONTRATADO entrega à CONTRATANTE os seguintes documentos e informações:", ...paragrafos(txt(v.documentos)).map((d) => `• ${d}`)] },
        { tipo: "clausula", titulo: "Da quitação", paragrafos: [txt(v.pendencias, "Não há pendências financeiras entre as partes."), "As partes dão plena quitação quanto às obrigações do contrato, ressalvadas as pendências acima e a responsabilidade técnica de cada um pelos períodos em que atuou."] },
        { tipo: "local_data", texto: localData(v.cidade, v.dataDocumento) },
        { tipo: "assinaturas", partes: [assinaturaCliente(v, "Contratante"), { nome: e.nome, qualificacao: ["Contratado", e.responsavel, e.crc && `CRC ${e.crc}`].filter(Boolean).join(" — ") }] },
      ],
    }),
  },
  {
    slug: "comunicado-reajuste",
    nome: "Comunicado de reajuste anual de honorários",
    categoria: "Comunicados e notificações",
    resumo: "Informa o novo valor com base no índice do contrato.",
    campos: [
      ...cliente("Cliente").slice(0, 2),
      { nome: "valorAtual", rotulo: "Honorário atual", tipo: "moeda", secao: "Reajuste" },
      { nome: "indice", rotulo: "Índice", tipo: "selecao", padrao: "IPCA", secao: "Reajuste", opcoes: [{ valor: "IPCA", rotulo: "IPCA" }, { valor: "INPC", rotulo: "INPC" }, { valor: "IGP-M", rotulo: "IGP-M" }] },
      { nome: "percentual", rotulo: "Variação acumulada em 12 meses (%)", tipo: "percentual", secao: "Reajuste" },
      { nome: "aPartirDe", rotulo: "Novo valor a partir de (mês/ano)", tipo: "texto", secao: "Reajuste", ajuda: "Ex.: janeiro de 2027." },
      ...localEData,
    ],
    titulo: (v) => `Reajuste de honorários — ${txt(v.clienteNome)}`,
    gerar: ({ escritorio: e, v }) => {
      const calculavel = Number.isFinite(Number(v.valorAtual)) && Number.isFinite(Number(v.percentual)) && v.valorAtual !== undefined && v.percentual !== undefined;
      const novo = calculavel ? Math.round(Number(v.valorAtual) * (1 + Number(v.percentual) / 100) * 100) / 100 : undefined;
      return {
        titulo: "Comunicado de Reajuste de Honorários",
        blocos: [
          { tipo: "paragrafo", texto: `Prezado(a) cliente ${txt(v.clienteNome)},` },
          {
            tipo: "paragrafo",
            texto: `Conforme previsto em nosso contrato de prestação de serviços, informamos que os honorários mensais serão reajustados pela variação acumulada do ${txt(v.indice)} nos últimos 12 meses, de ${percentual(v.percentual)}.`,
          },
          { tipo: "lista", itens: [`Valor atual: ${moedaExtenso(v.valorAtual)}`, `Novo valor: ${moedaExtenso(novo)}`, `Vigência: a partir de ${txt(v.aPartirDe)}`] },
          { tipo: "paragrafo", texto: "Seguimos à disposição e agradecemos a confiança em nosso trabalho." },
          { tipo: "local_data", texto: localData(v.cidade, v.dataDocumento) },
          { tipo: "assinaturas", partes: [{ nome: e.nome, qualificacao: e.responsavel ?? undefined }] },
        ],
      };
    },
  },
  {
    slug: "notificacao-honorarios-atraso",
    nome: "Notificação de honorários em atraso",
    categoria: "Comunicados e notificações",
    resumo: "Notificação extrajudicial com parcelas em aberto e prazo para pagamento.",
    campos: [
      ...cliente("Notificado"),
      { nome: "parcelas", rotulo: "Parcelas em aberto", tipo: "texto_longo", secao: "Débito", ajuda: "Uma por linha. Ex.: Agosto/2026 — R$ 1.200,00" },
      { nome: "total", rotulo: "Total devido (atualizado)", tipo: "moeda", secao: "Débito" },
      { nome: "prazo", rotulo: "Prazo para pagamento (dias)", tipo: "inteiro", padrao: 10, min: 1, max: 60, secao: "Débito" },
      { nome: "suspensao", rotulo: "Avisar sobre suspensão dos serviços", tipo: "sim_nao", padrao: true, secao: "Débito" },
      ...localEData,
    ],
    titulo: (v) => `Notificação de débito — ${txt(v.clienteNome)}`,
    gerar: ({ escritorio: e, v }) => ({
      titulo: "Notificação Extrajudicial",
      blocos: [
        { tipo: "paragrafo", texto: `Notificante: ${qualificacaoEscritorio(e)}.` },
        { tipo: "paragrafo", texto: `Notificado(a): ${qualificacaoCliente(v)}.` },
        { tipo: "paragrafo", texto: "Pela presente, fica V. Sa. notificado(a) de que constam em aberto os seguintes honorários decorrentes do contrato de prestação de serviços contábeis:" },
        { tipo: "lista", itens: paragrafos(txt(v.parcelas)) },
        {
          tipo: "paragrafo",
          texto: `O débito totaliza ${moedaExtenso(v.total)}, já acrescido dos encargos contratuais. Solicitamos a regularização no prazo de ${txt(v.prazo)} dias a contar do recebimento desta notificação.`,
        },
        ...(v.suspensao
          ? [{ tipo: "paragrafo" as const, texto: "Decorrido o prazo sem pagamento, os serviços poderão ser suspensos, conforme previsto em contrato, sem prejuízo da cobrança judicial do débito, permanecendo o notificado responsável pelas obrigações fiscais do período." }]
          : []),
        { tipo: "paragrafo", texto: "Caso o pagamento já tenha sido efetuado, pedimos que desconsidere esta notificação e nos envie o comprovante." },
        { tipo: "local_data", texto: localData(v.cidade, v.dataDocumento) },
        { tipo: "assinaturas", partes: [{ nome: e.nome, qualificacao: e.responsavel ?? undefined }] },
      ],
    }),
  },
  {
    slug: "comunicado-cliente",
    nome: "Comunicado ao cliente",
    categoria: "Comunicados e notificações",
    resumo: "Comunicado livre com a identidade do escritório (prazos, mudanças de legislação, avisos).",
    campos: [
      { nome: "assunto", rotulo: "Assunto", tipo: "texto", secao: "Comunicado" },
      { nome: "destinatario", rotulo: "Destinatário", tipo: "texto", padrao: "Prezados clientes", preencherDe: "cliente.nome", secao: "Comunicado" },
      { nome: "corpo", rotulo: "Texto do comunicado", tipo: "texto_longo", secao: "Comunicado", ajuda: "Separe os parágrafos com uma linha em branco." },
      ...localEData,
    ],
    titulo: (v) => `Comunicado — ${txt(v.assunto)}`,
    gerar: ({ escritorio: e, v }) => ({
      titulo: txt(v.assunto),
      blocos: [
        { tipo: "paragrafo", texto: `${txt(v.destinatario)},` },
        ...paragrafos(txt(v.corpo)).map((p) => ({ tipo: "paragrafo" as const, texto: p })),
        { tipo: "local_data", texto: localData(v.cidade, v.dataDocumento) },
        { tipo: "assinaturas", partes: [{ nome: e.nome, qualificacao: e.responsavel ?? undefined }] },
      ],
    }),
  },
  {
    slug: "procuracao",
    nome: "Procuração para representação em órgãos públicos",
    categoria: "Procurações e declarações",
    resumo: "Poderes para representar o cliente na Receita, Junta Comercial, prefeitura e outros órgãos.",
    campos: [
      ...cliente("Outorgante"),
      { nome: "outorgado", rotulo: "Outorgado (nome completo)", tipo: "texto", secao: "Outorgado", ajuda: "Pessoa que receberá os poderes." },
      { nome: "outorgadoCpf", rotulo: "CPF do outorgado", tipo: "texto", secao: "Outorgado" },
      { nome: "orgaos", rotulo: "Órgãos", tipo: "texto_longo", secao: "Poderes", padrao: "Receita Federal do Brasil\nJunta Comercial do Estado\nSecretaria da Fazenda do Estado\nPrefeitura Municipal\nCaixa Econômica Federal" },
      { nome: "validade", rotulo: "Validade", tipo: "texto", padrao: "1 (um) ano", secao: "Poderes" },
      ...localEData,
    ],
    titulo: (v) => `Procuração — ${txt(v.clienteNome)} para ${txt(v.outorgado)}`,
    gerar: ({ v }) => ({
      titulo: "Procuração",
      blocos: [
        { tipo: "paragrafo", texto: `OUTORGANTE: ${qualificacaoCliente(v)}.` },
        { tipo: "paragrafo", texto: `OUTORGADO: ${txt(v.outorgado)}, inscrito(a) no CPF sob o nº ${txt(v.outorgadoCpf)}.` },
        { tipo: "paragrafo", texto: "PODERES: representar o(a) OUTORGANTE perante os órgãos abaixo, podendo requerer, protocolar, retirar documentos, prestar declarações, solicitar certidões, cumprir exigências e assinar o que for necessário ao bom cumprimento deste mandato:" },
        { tipo: "lista", itens: paragrafos(txt(v.orgaos)) },
        { tipo: "paragrafo", texto: `Vedado o substabelecimento. Validade: ${txt(v.validade)} a contar desta data.` },
        { tipo: "local_data", texto: localData(v.cidade, v.dataDocumento) },
        { tipo: "assinaturas", partes: [assinaturaCliente(v, "Outorgante")] },
      ],
    }),
  },
  {
    slug: "protocolo-entrega",
    nome: "Protocolo de entrega de documentos",
    categoria: "Procurações e declarações",
    resumo: "Registra documentos entregues ou recebidos, com data e assinatura.",
    campos: [
      ...cliente("Cliente").slice(0, 2),
      { nome: "sentido", rotulo: "Sentido", tipo: "selecao", padrao: "entrega", secao: "Protocolo", opcoes: [{ valor: "entrega", rotulo: "Escritório entrega ao cliente" }, { valor: "recebimento", rotulo: "Escritório recebe do cliente" }] },
      { nome: "itens", rotulo: "Documentos", tipo: "texto_longo", secao: "Protocolo", ajuda: "Um por linha." },
      { nome: "observacoes", rotulo: "Observações", tipo: "texto_longo", opcional: true, secao: "Protocolo" },
      ...localEData,
    ],
    titulo: (v) => `Protocolo de ${v.sentido === "entrega" ? "entrega" : "recebimento"} — ${txt(v.clienteNome)}`,
    gerar: ({ escritorio: e, v }) => {
      const entrega = v.sentido === "entrega";
      return {
        titulo: entrega ? "Protocolo de Entrega de Documentos" : "Protocolo de Recebimento de Documentos",
        blocos: [
          {
            tipo: "paragrafo",
            texto: entrega
              ? `${e.nome} entrega a ${txt(v.clienteNome)}${v.clienteDocumento ? ` (${txt(v.clienteDocumento)})` : ""} os documentos abaixo:`
              : `${e.nome} declara ter recebido de ${txt(v.clienteNome)}${v.clienteDocumento ? ` (${txt(v.clienteDocumento)})` : ""} os documentos abaixo:`,
          },
          { tipo: "lista", itens: paragrafos(txt(v.itens)) },
          ...(v.observacoes ? [{ tipo: "paragrafo" as const, texto: `Observações: ${txt(v.observacoes)}` }] : []),
          { tipo: "local_data", texto: localData(v.cidade, v.dataDocumento) },
          {
            tipo: "assinaturas",
            partes: entrega
              ? [{ nome: e.nome, qualificacao: "Entregue por" }, { nome: txt(v.clienteNome), qualificacao: "Recebido por" }]
              : [{ nome: txt(v.clienteNome), qualificacao: "Entregue por" }, { nome: e.nome, qualificacao: "Recebido por" }],
          },
        ],
      };
    },
  },
  {
    slug: "edital-assembleia-condominio",
    nome: "Edital de convocação de assembleia de condomínio",
    categoria: "Condomínios",
    resumo: "Convocação de assembleia ordinária ou extraordinária, com ordem do dia.",
    campos: [
      { nome: "condominio", rotulo: "Nome do condomínio", tipo: "texto", preencherDe: "cliente.nome", secao: "Condomínio" },
      { nome: "cnpj", rotulo: "CNPJ do condomínio", tipo: "texto", opcional: true, preencherDe: "cliente.documento", secao: "Condomínio" },
      { nome: "tipoAssembleia", rotulo: "Tipo de assembleia", tipo: "selecao", padrao: "ordinaria", secao: "Assembleia", opcoes: [{ valor: "ordinaria", rotulo: "Ordinária (AGO)" }, { valor: "extraordinaria", rotulo: "Extraordinária (AGE)" }] },
      { nome: "dataAssembleia", rotulo: "Data da assembleia", tipo: "data", secao: "Assembleia" },
      { nome: "hora1", rotulo: "1ª convocação (horário)", tipo: "texto", padrao: "19h00", secao: "Assembleia" },
      { nome: "hora2", rotulo: "2ª convocação (horário)", tipo: "texto", padrao: "19h30", secao: "Assembleia" },
      { nome: "localAssembleia", rotulo: "Local ou link da reunião", tipo: "texto", padrao: "Salão de festas do condomínio", secao: "Assembleia" },
      {
        nome: "ordemDia",
        rotulo: "Ordem do dia",
        tipo: "texto_longo",
        secao: "Assembleia",
        padrao: "Prestação de contas do exercício anterior\nAprovação da previsão orçamentária e do rateio\nEleição de síndico, subsíndico e conselho fiscal\nAssuntos gerais",
        ajuda: "Um item por linha. Assuntos gerais não permitem deliberações que exijam quórum especial.",
      },
      { nome: "sindico", rotulo: "Síndico(a) que convoca", tipo: "texto", secao: "Assinatura" },
      ...localEData,
    ],
    titulo: (v) => `Edital de ${v.tipoAssembleia === "ordinaria" ? "AGO" : "AGE"} — ${txt(v.condominio)}`,
    gerar: ({ v }) => {
      const ordinaria = v.tipoAssembleia === "ordinaria";
      return {
        titulo: `Edital de Convocação — Assembleia Geral ${ordinaria ? "Ordinária" : "Extraordinária"}`,
        blocos: [
          { tipo: "paragrafo", texto: `${txt(v.condominio)}${v.cnpj ? ` — CNPJ ${txt(v.cnpj)}` : ""}` },
          {
            tipo: "paragrafo",
            texto: `O(A) síndico(a), no uso de suas atribuições legais e convencionais, convoca os senhores condôminos para a Assembleia Geral ${ordinaria ? "Ordinária" : "Extraordinária"} a realizar-se em ${data(v.dataAssembleia)}, no(a) ${txt(v.localAssembleia)}, às ${txt(v.hora1)} em primeira convocação, com a presença mínima prevista na convenção, ou às ${txt(v.hora2)} em segunda convocação, com qualquer número de presentes, para deliberar sobre a seguinte ordem do dia:`,
          },
          { tipo: "lista", itens: paragrafos(txt(v.ordemDia)).map((item, i) => `${i + 1}. ${item}`) },
          {
            tipo: "paragrafo",
            texto: "Os condôminos poderão se fazer representar por procurador munido de instrumento de mandato. Somente poderão votar os condôminos quites com suas contribuições, nos termos do art. 1.335, III, do Código Civil.",
          },
          { tipo: "local_data", texto: localData(v.cidade, v.dataDocumento) },
          { tipo: "assinaturas", partes: [{ nome: txt(v.sindico), qualificacao: "Síndico(a)" }] },
        ],
      };
    },
  },
];

export function buscarModelo(slug: string): ModeloDocumento | undefined {
  return MODELOS.find((m) => m.slug === slug);
}
