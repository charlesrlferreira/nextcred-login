import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BotaoImprimir } from "@/components/BotaoImprimir";
import { PassoDetalhe } from "@/components/PassoDetalhe";
import { FolhaA4, Timbre } from "@/components/Timbre";
import { exigirUsuario } from "@/lib/auth/dal";
import { buscarChecklist } from "@/lib/checklists/catalogo";
import { buscarChecklistCliente, dataHora } from "@/lib/dados";

export const metadata: Metadata = { title: "Checklist", robots: { index: false } };
export const instant = false;

export default async function ImprimirChecklist({ params }: PageProps<"/imprimir/checklist/[id]">) {
  const { id } = await params;
  const { escritorio } = await exigirUsuario();
  const linha = await buscarChecklistCliente(escritorio.id, id);
  if (!linha) notFound();
  const { checklist, clienteNome, clienteDocumento } = linha;
  const modelo = buscarChecklist(checklist.modelo);
  if (!modelo) notFound();
  const feitos = new Set(checklist.concluidos);

  return (
    <FolhaA4 botao={<BotaoImprimir />}>
      <Timbre escritorio={escritorio} data={dataHora(checklist.atualizadoEm)} />
      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-destaque-escuro">Checklist · {modelo.area}</p>
        <h1 className="mt-1 text-xl font-bold">{checklist.titulo}</h1>
        {clienteNome && (
          <p className="mt-1 text-sm text-slate-600">
            Cliente: <strong>{clienteNome}</strong>
            {clienteDocumento ? ` · ${clienteDocumento}` : ""}
          </p>
        )}
        <p className="mt-1 text-sm text-slate-600">
          Andamento: {feitos.size} de {modelo.passos.length} passos concluídos
        </p>
      </section>
      <ol className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200">
        {modelo.passos.map((p, i) => (
          <li key={i} className="flex gap-3 p-3 break-inside-avoid">
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold ${feitos.has(i) ? "border-destaque bg-destaque text-white" : "border-slate-400"}`}>
              {feitos.has(i) ? "✓" : ""}
            </span>
            <div>
              <p className="font-medium">{i + 1}. {p.titulo}</p>
              <PassoDetalhe passo={p} />
            </div>
          </li>
        ))}
      </ol>
      {checklist.observacoes && (
        <section className="mt-5 rounded-xl border border-slate-200 p-4 break-inside-avoid">
          <h2 className="mb-1 text-sm font-semibold">Observações</h2>
          <p className="whitespace-pre-line text-sm text-slate-700">{checklist.observacoes}</p>
        </section>
      )}
    </FolhaA4>
  );
}
