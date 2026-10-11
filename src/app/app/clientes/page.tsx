import type { Metadata } from "next";
import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { listarClientes } from "@/lib/dados";
import { excluirCliente } from "./acoes";
import { NovoCliente } from "./NovoCliente";

export const metadata: Metadata = { title: "Clientes" };

export default async function Clientes() {
  const { escritorio } = await exigirUsuario();
  const lista = await listarClientes(escritorio.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-600">Vincule os cálculos aos clientes para encontrar tudo depois.</p>
        </div>
        {lista.length === 0 ? (
          <div className="cartao p-10 text-center text-slate-500">Nenhum cliente cadastrado.</div>
        ) : (
          <ul className="cartao divide-y divide-slate-100">
            {lista.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-slate-900">{c.nome}</p>
                  <p className="text-xs text-slate-500">{[c.documento, c.regime, c.email].filter(Boolean).join(" · ") || "Sem dados adicionais"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden gap-3 text-sm font-medium text-marca sm:flex">
                    <Link href={`/app/ferramentas?cliente=${c.id}`} className="hover:underline">Cálculo</Link>
                    <Link href={`/app/checklists?cliente=${c.id}`} className="hover:underline">Checklist</Link>
                    <Link href={`/app/modelos?cliente=${c.id}`} className="hover:underline">Documento</Link>
                  </span>
                  <form action={excluirCliente.bind(null, c.id)}>
                    <button className="btn-perigo px-3 py-1.5 text-xs">Excluir</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <NovoCliente />
    </div>
  );
}
