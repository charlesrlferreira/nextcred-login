import type { Metadata } from "next";
import Link from "next/link";
import { AREAS, FERRAMENTAS } from "@/lib/ferramentas/registro";

export const metadata: Metadata = { title: "Ferramentas" };

export default async function Ferramentas({ searchParams }: PageProps<"/app/ferramentas">) {
  const { cliente } = await searchParams;
  const sufixo = typeof cliente === "string" && /^[0-9a-f-]{36}$/i.test(cliente) ? `?cliente=${cliente}` : "";
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ferramentas</h1>
        <p className="text-slate-600">{FERRAMENTAS.length} ferramentas com memória de cálculo, base legal e PDF.</p>
      </div>
      {AREAS.map((area) => (
        <section key={area}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-destaque-escuro">{area}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FERRAMENTAS.filter((f) => f.area === area).map((f) => (
              <Link key={f.slug} href={`/app/ferramentas/${f.slug}${sufixo}`} className="cartao p-5 transition hover:border-destaque hover:shadow-md">
                <p className="font-semibold text-slate-900">{f.nome}</p>
                <p className="mt-1 text-sm text-slate-600">{f.resumo}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
