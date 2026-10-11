import type { Metadata } from "next";
import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { dataHora, listarCalculos, listarClientes } from "@/lib/dados";
import { buscarFerramenta, FERRAMENTAS } from "@/lib/ferramentas/registro";

export const metadata: Metadata = { title: "Painel" };

export default async function Painel() {
  const { escritorio } = await exigirUsuario();
  const [recentes, clientes] = await Promise.all([listarCalculos(escritorio.id, 6), listarClientes(escritorio.id)]);
  const semConfigurar = escritorio.nome === "Meu escritório" || !escritorio.logo;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Olá, {escritorio.nome}</h1>
        <p className="text-slate-600">Escolha uma ferramenta ou continue de onde parou.</p>
      </div>

      {semConfigurar && (
        <div className="flex flex-col gap-3 rounded-2xl border border-marca/20 bg-marca-claro p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-marca">
            <strong>Personalize seus documentos:</strong> cadastre o nome, o CNPJ e o logo do escritório para que apareçam nos PDFs.
          </p>
          <Link href="/app/escritorio" className="btn-marca shrink-0">Configurar escritório</Link>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Ferramentas</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {FERRAMENTAS.map((f) => (
            <Link key={f.slug} href={`/app/ferramentas/${f.slug}`} className="cartao p-4 transition hover:border-destaque hover:shadow-md">
              <p className="text-xs font-medium text-destaque-escuro">{f.area}</p>
              <p className="mt-1 font-semibold leading-snug text-slate-900">{f.nome}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="cartao p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Últimos cálculos</h2>
            <Link href="/app/calculos" className="text-sm font-medium text-marca hover:underline">Ver todos</Link>
          </div>
          {recentes.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Nenhum cálculo ainda. Escolha uma ferramenta acima para começar.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentes.map((c) => (
                <li key={c.id}>
                  <Link href={`/app/calculos/${c.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-marca">
                    <span>
                      <span className="block text-sm font-medium">{c.titulo}</span>
                      <span className="text-xs text-slate-500">
                        {buscarFerramenta(c.ferramenta)?.nome}
                        {c.clienteNome ? ` · ${c.clienteNome}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">{dataHora(c.criadoEm)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="cartao p-5">
          <h2 className="font-semibold text-slate-900">Clientes</h2>
          <p className="mt-1 text-3xl font-bold text-marca">{clientes.length}</p>
          <p className="text-sm text-slate-600">cadastrados para vincular aos cálculos.</p>
          <Link href="/app/clientes" className="btn-secundario mt-4 w-full">Gerenciar clientes</Link>
        </section>
      </div>
    </div>
  );
}
