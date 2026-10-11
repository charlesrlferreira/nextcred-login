import type { Metadata } from "next";
import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { dataHora, listarCalculos } from "@/lib/dados";
import { buscarFerramenta } from "@/lib/ferramentas/registro";

export const metadata: Metadata = { title: "Histórico" };

export default async function Historico() {
  const { escritorio } = await exigirUsuario();
  const lista = await listarCalculos(escritorio.id, 200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Histórico de cálculos</h1>
        <p className="text-slate-600">Todos os cálculos do escritório, do mais recente ao mais antigo.</p>
      </div>
      {lista.length === 0 ? (
        <div className="cartao p-10 text-center text-slate-500">
          Nenhum cálculo salvo ainda. <Link href="/app/ferramentas" className="font-medium text-marca hover:underline">Abrir ferramentas</Link>
        </div>
      ) : (
        <div className="cartao overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Cálculo</th>
                  <th className="px-4 py-3 font-medium">Ferramenta</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lista.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link href={`/app/calculos/${c.id}`} className="hover:text-marca">{c.titulo}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{buscarFerramenta(c.ferramenta)?.nome ?? c.ferramenta}</td>
                    <td className="px-4 py-3 text-slate-600">{c.clienteNome ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{dataHora(c.criadoEm)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <a href={`/imprimir/${c.id}`} target="_blank" className="font-medium text-marca hover:underline">PDF</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
