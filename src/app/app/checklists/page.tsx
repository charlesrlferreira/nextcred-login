import type { Metadata } from "next";
import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/dal";
import { AREAS_CHECKLIST, buscarChecklist, CHECKLISTS } from "@/lib/checklists/catalogo";
import { dataHora, listarChecklists } from "@/lib/dados";

export const metadata: Metadata = { title: "Checklists" };

export default async function Checklists({ searchParams }: PageProps<"/app/checklists">) {
  const { cliente } = await searchParams;
  const sufixo = typeof cliente === "string" && /^[0-9a-f-]{36}$/i.test(cliente) ? `?cliente=${cliente}` : "";
  const { escritorio } = await exigirUsuario();
  const emAndamento = await listarChecklists(escritorio.id, 50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Checklists</h1>
        <p className="text-slate-600">Roteiros passo a passo com prazo, documentos e base legal. Crie uma cópia por cliente e marque o andamento.</p>
      </div>

      {emAndamento.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Seus checklists</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {emAndamento.map((c) => {
              const total = buscarChecklist(c.modelo)?.passos.length ?? 0;
              const feitos = c.concluidos.length;
              const pctFeito = total ? Math.round((feitos / total) * 100) : 0;
              return (
                <Link key={c.id} href={`/app/checklists/${c.id}`} className="cartao p-4 transition hover:border-destaque hover:shadow-md">
                  <p className="font-semibold text-slate-900">{c.titulo}</p>
                  <p className="text-xs text-slate-500">{c.clienteNome ?? "Sem cliente"} · atualizado em {dataHora(c.atualizadoEm)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${pctFeito === 100 ? "bg-destaque" : "bg-marca"}`} style={{ width: `${pctFeito}%` }} />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{feitos}/{total}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {AREAS_CHECKLIST.map((area) => (
        <section key={area}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-destaque-escuro">{area}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKLISTS.filter((c) => c.area === area).map((c) => (
              <Link key={c.slug} href={`/app/checklists/modelo/${c.slug}${sufixo}`} className="cartao p-5 transition hover:border-destaque hover:shadow-md">
                <p className="font-semibold text-slate-900">{c.titulo}</p>
                <p className="mt-1 text-sm text-slate-600">{c.descricao}</p>
                <p className="mt-2 text-xs font-medium text-slate-500">{c.passos.length} passos</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
