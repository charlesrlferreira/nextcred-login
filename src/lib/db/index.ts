import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não configurada.");

// Reaproveita a conexão entre recargas do servidor de desenvolvimento.
const globalDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };
const sql = globalDb.sql ?? postgres(url, { max: 5, prepare: false });
if (process.env.NODE_ENV !== "production") globalDb.sql = sql;

export const db = drizzle(sql, { schema });
export * from "./schema";
