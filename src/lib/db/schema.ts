import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const escritorios = pgTable("escritorios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  cnpj: text("cnpj"),
  crc: text("crc"),
  responsavel: text("responsavel"),
  telefone: text("telefone"),
  email: text("email"),
  endereco: text("endereco"),
  /** Logo como data URL (PNG/JPEG/WebP redimensionado no navegador, até ~300 KB). */
  logo: text("logo"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  nome: text("nome"),
  escritorioId: uuid("escritorio_id")
    .notNull()
    .references(() => escritorios.id, { onDelete: "cascade" }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  ultimoAcesso: timestamp("ultimo_acesso", { withTimezone: true }),
});

export const codigosLogin = pgTable(
  "codigos_login",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    codigoHash: text("codigo_hash").notNull(),
    expiraEm: timestamp("expira_em", { withTimezone: true }).notNull(),
    tentativas: integer("tentativas").notNull().default(0),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("codigos_login_email_idx").on(t.email)],
);

export const clientes = pgTable(
  "clientes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    escritorioId: uuid("escritorio_id")
      .notNull()
      .references(() => escritorios.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    documento: text("documento"),
    email: text("email"),
    regime: text("regime"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("clientes_escritorio_idx").on(t.escritorioId)],
);

export const calculos = pgTable(
  "calculos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    escritorioId: uuid("escritorio_id")
      .notNull()
      .references(() => escritorios.id, { onDelete: "cascade" }),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    clienteId: uuid("cliente_id").references(() => clientes.id, { onDelete: "set null" }),
    ferramenta: text("ferramenta").notNull(),
    titulo: text("titulo").notNull(),
    entrada: jsonb("entrada").notNull(),
    resultado: jsonb("resultado").notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("calculos_escritorio_idx").on(t.escritorioId, t.criadoEm)],
);

export const checklists = pgTable(
  "checklists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    escritorioId: uuid("escritorio_id")
      .notNull()
      .references(() => escritorios.id, { onDelete: "cascade" }),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    clienteId: uuid("cliente_id").references(() => clientes.id, { onDelete: "set null" }),
    modelo: text("modelo").notNull(),
    titulo: text("titulo").notNull(),
    /** Índices dos passos concluídos. */
    concluidos: jsonb("concluidos").$type<number[]>().notNull().default([]),
    observacoes: text("observacoes"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("checklists_escritorio_idx").on(t.escritorioId, t.atualizadoEm)],
);

export const documentos = pgTable(
  "documentos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    escritorioId: uuid("escritorio_id")
      .notNull()
      .references(() => escritorios.id, { onDelete: "cascade" }),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    clienteId: uuid("cliente_id").references(() => clientes.id, { onDelete: "set null" }),
    modelo: text("modelo").notNull(),
    titulo: text("titulo").notNull(),
    campos: jsonb("campos").notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("documentos_escritorio_idx").on(t.escritorioId, t.criadoEm)],
);

export type Escritorio = typeof escritorios.$inferSelect;
export type Cliente = typeof clientes.$inferSelect;
export type Calculo = typeof calculos.$inferSelect;
