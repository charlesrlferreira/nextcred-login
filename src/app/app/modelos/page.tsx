import type { Metadata } from "next";
import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { dataHora, listarDocumentos } from "@/lib/dados";
import { buscarModelo, CATEGORIAS_MODELO, MODELOS } from "@/lib/modelos/catalogo";

export const metadata: Metadata = { title: "Modelos de documentos" };

export default async function Modelos({ searchParams }: PageProps<"/app/modelos">) {
  const { cliente } = await searchParams;
  const sufixo = typeof cliente === "string" && /^[0-9a-f-]{36}$/i.test(cliente) ? `?cliente=${cliente}` : "";
  const { escritorio } = await exigirUsuario();
  const recentes = await listarDocumentos(escritorio.id, 20);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Modelos de documentos</h1>
        <p className="text-slate-600">Preencha os campos e o documento sai pronto, com o timbre do seu escritório, em PDF ou no Word.</p>
      </div>

      {CATEGORIAS_MODELO.map((cat) => (
        <section key={cat}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-destaque-escuro">{cat}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MODELOS.filter((m) => m.categoria === cat).map((m) => (
              <Link key={m.slug} href={`/app/modelos/${m.slug}${sufixo}`} className="cartao p-5 transition hover:border-destaque hover:shadow-md">
                <p className="font-semibold text-slate-900">{m.nome}</p>
                <p className="mt-1 text-sm text-slate-600">{m.resumo}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="cartao p-5">
        <h2 className="mb-3 font-semibold text-slate-900">Documentos gerados</h2>
        {recentes.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">Nenhum documento salvo ainda.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentes.map((d) => (
              <li key={d.id}>
                <Link href={`/app/documentos/${d.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-marca">
                  <span>
                    <span className="block text-sm font-medium">{d.titulo}</span>
                    <span className="text-xs text-slate-500">
                      {buscarModelo(d.modelo)?.nome}
                      {d.clienteNome ? ` · ${d.clienteNome}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">{dataHora(d.criadoEm)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
