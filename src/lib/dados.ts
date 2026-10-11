import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { calculos, checklists, clientes, db, documentos } from "@/lib/db";

/** Todas as consultas filtram pelo escritório da sessão. */

export function listarClientes(escritorioId: string) {
  return db.select().from(clientes).where(eq(clientes.escritorioId, escritorioId)).orderBy(asc(clientes.nome));
}

export async function buscarCliente(escritorioId: string, id: string) {
  const [c] = await db.select().from(clientes).where(and(eq(clientes.id, id), eq(clientes.escritorioId, escritorioId))).limit(1);
  return c ?? null;
}

export function listarCalculos(escritorioId: string, limite = 100) {
  return db
    .select({
      id: calculos.id,
      ferramenta: calculos.ferramenta,
      titulo: calculos.titulo,
      criadoEm: calculos.criadoEm,
      clienteNome: clientes.nome,
    })
    .from(calculos)
    .leftJoin(clientes, eq(calculos.clienteId, clientes.id))
    .where(eq(calculos.escritorioId, escritorioId))
    .orderBy(desc(calculos.criadoEm))
    .limit(limite);
}

export async function buscarCalculo(escritorioId: string, id: string) {
  if (!UUID.test(id)) return null;
  const [linha] = await db
    .select({ calculo: calculos, clienteNome: clientes.nome, clienteDocumento: clientes.documento })
    .from(calculos)
    .leftJoin(clientes, eq(calculos.clienteId, clientes.id))
    .where(and(eq(calculos.id, id), eq(calculos.escritorioId, escritorioId)))
    .limit(1);
  return linha ?? null;
}

const UUID = /^[0-9a-f-]{36}$/i;

export function listarChecklists(escritorioId: string, limite = 100) {
  return db
    .select({
      id: checklists.id,
      modelo: checklists.modelo,
      titulo: checklists.titulo,
      concluidos: checklists.concluidos,
      atualizadoEm: checklists.atualizadoEm,
      clienteNome: clientes.nome,
    })
    .from(checklists)
    .leftJoin(clientes, eq(checklists.clienteId, clientes.id))
    .where(eq(checklists.escritorioId, escritorioId))
    .orderBy(desc(checklists.atualizadoEm))
    .limit(limite);
}

export async function buscarChecklistCliente(escritorioId: string, id: string) {
  if (!UUID.test(id)) return null;
  const [linha] = await db
    .select({ checklist: checklists, clienteNome: clientes.nome, clienteDocumento: clientes.documento })
    .from(checklists)
    .leftJoin(clientes, eq(checklists.clienteId, clientes.id))
    .where(and(eq(checklists.id, id), eq(checklists.escritorioId, escritorioId)))
    .limit(1);
  return linha ?? null;
}

export function listarDocumentos(escritorioId: string, limite = 100) {
  return db
    .select({ id: documentos.id, modelo: documentos.modelo, titulo: documentos.titulo, criadoEm: documentos.criadoEm, clienteNome: clientes.nome })
    .from(documentos)
    .leftJoin(clientes, eq(documentos.clienteId, clientes.id))
    .where(eq(documentos.escritorioId, escritorioId))
    .orderBy(desc(documentos.criadoEm))
    .limit(limite);
}

export async function buscarDocumento(escritorioId: string, id: string) {
  if (!UUID.test(id)) return null;
  const [linha] = await db
    .select({ documento: documentos, clienteNome: clientes.nome })
    .from(documentos)
    .leftJoin(clientes, eq(documentos.clienteId, clientes.id))
    .where(and(eq(documentos.id, id), eq(documentos.escritorioId, escritorioId)))
    .limit(1);
  return linha ?? null;
}

export const dataHora = (d: Date) =>
  d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });
