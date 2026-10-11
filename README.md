# Tag Brasil — Ferramentas contábeis

Plataforma web para escritórios contábeis: calculadoras trabalhistas e tributárias com memória de cálculo,
base legal citada, histórico por cliente e PDF A4 com o logo do escritório.

## O que já está pronto

| Área | Ferramentas |
|---|---|
| Departamento Pessoal | Rescisão (7 tipos), Férias, 13º salário, INSS e IRRF |
| Tributário | DAS do Simples Nacional, Fator R, Comparador de regimes, Pró-labore x lucros |
| Débitos e Multas | Multas e juros de tributos federais em atraso |
| Escritório Contábil | Precificação de honorários |

Base da plataforma:

- Login sem senha (código de 6 dígitos por e-mail, válido por 10 minutos, com limite de tentativas).
- Cadastro do escritório (nome, CNPJ, CRC, responsável, contato e logo).
- Cadastro de clientes e vínculo dos cálculos a cada cliente.
- Histórico com reabrir, duplicar e editar, e excluir.
- PDF A4 (impressão do navegador) e cópia para o Word com as tabelas.
- Funciona no celular e pode ser adicionado à tela inicial (manifest PWA).

## Tecnologia

- **Next.js 16** (App Router, Server Actions, Cache Components) + **React 19** + **Tailwind CSS 4**
- **PostgreSQL** com **Drizzle ORM** (migrações em `drizzle/`)
- Sessão em cookie assinado (JWT HS256 via `jose`)
- E-mail transacional via **Resend**
- Testes dos cálculos com **Vitest**

## Estrutura

```
src/lib/calc/          Cálculos puros (sem banco), um arquivo por tema
src/lib/calc/tabelas.ts  ← TODAS as alíquotas, faixas e tetos. Revisar a cada ano.
src/lib/ferramentas/   Catálogo: campos de cada formulário, validação e exibição
src/lib/db/            Esquema do banco e conexão
src/lib/auth/          Sessão, envio do código e acesso ao usuário logado
src/app/               Páginas: início, /entrar, /app/*, /imprimir/[id]
tests/                 Testes dos cálculos com valores conferidos
```

### Como adicionar uma ferramenta nova

1. Escreva a função de cálculo em `src/lib/calc/` retornando um `Resultado` (destaques, tabelas, memória, alertas, base legal).
2. Registre em `src/lib/ferramentas/registro.ts` com os campos do formulário.
3. Adicione testes em `tests/`.

O formulário, a validação, o histórico e o PDF passam a funcionar automaticamente.

## Rodando localmente

```bash
cp .env.example .env        # preencha DATABASE_URL e SESSION_SECRET
npm install
npm run db:migrate
npm run dev                 # http://localhost:3000
npm test                    # testes dos cálculos
```

Sem `RESEND_API_KEY`, o código de acesso aparece no terminal (só em desenvolvimento).

## Publicação (recomendado: Vercel + Neon + Resend)

1. **Vercel**: importe o repositório em vercel.com/new.
2. **Banco**: no projeto da Vercel, aba *Storage* → *Neon (Postgres)*. A variável `DATABASE_URL` é criada automaticamente.
3. **Variáveis de ambiente** (Settings → Environment Variables):
   - `SESSION_SECRET`: gere com `openssl rand -base64 32`
   - `RESEND_API_KEY`: crie a conta em resend.com e verifique o domínio do remetente
   - `EMAIL_REMETENTE`: por exemplo `Tag Brasil <acesso@tagbrasil.com.br>`
4. Faça o deploy. O script `vercel-build` aplica as migrações do banco antes do build.

Os três serviços têm plano gratuito suficiente para começar.

## Avisos importantes

- As tabelas de 2026 (salário mínimo, INSS, IRRF com o redutor da Lei 15.270/2025, Simples Nacional e a presunção
  da LC 224/2025) estão em `src/lib/calc/tabelas.ts` e **devem ser conferidas por um profissional** antes do uso com clientes.
- O comparador de regimes é uma estimativa anual simplificada (sem ICMS-ST, monofásicos, benefícios fiscais ou prejuízos acumulados).
- Na multa e juros, a Selic acumulada é informada pelo usuário a partir da tabela da Receita Federal.
