import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PassoDetalhe } from "@/components/PassoDetalhe";
import { exigirUsuario } from "@/lib/auth/dal";
import { buscarChecklist } from "@/lib/checklists/catalogo";
import { listarClientes } from "@/lib/dados";
import { criarChecklist } from "../../acoes";

export async function generateMetadata({ params }: PageProps<"/app/checklists/modelo/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: buscarChecklist(slug)?.titulo ?? "Checklist" };
}

export default async function ModeloChecklist({ params, searchParams }: PageProps<"/app/checklists/modelo/[slug]">) {
  const { slug } = await params;
  const modelo = buscarChecklist(slug);
  if (!modelo) notFound();
  const { escritorio } = await exigirUsuario();
  const clientes = await listarClientes(escritorio.id);
  const { cliente } = await searchParams;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-500">
            <Link href="/app/checklists" className="hover:text-marca">Checklists</Link> · {modelo.area}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{modelo.titulo}</h1>
          <p className="text-slate-600">{modelo.descricao}</p>
        </div>
        <ol className="cartao divide-y divide-slate-100">
          {modelo.passos.map((p, i) => (
            <li key={i} className="flex gap-4 p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-marca-claro text-sm font-semibold text-marca">{i + 1}</span>
              <div>
                <p className="font-medium text-slate-900">{p.titulo}</p>
                <PassoDetalhe passo={p} />
              </div>
            </li>
          ))}
        </ol>
      </div>
      <form action={criarChecklist.bind(null, slug)} className="cartao h-fit space-y-4 p-5 lg:sticky lg:top-32">
        <h2 className="font-semibold text-slate-900">Usar este checklist</h2>
        <p className="text-sm text-slate-600">Cria uma cópia para acompanhar o andamento de um cliente.</p>
        <div>
          <label htmlFor="clienteId" className="rotulo">Cliente</label>
          <select id="clienteId" name="clienteId" className="campo" defaultValue={typeof cliente === "string" ? cliente : ""}>
            <option value="">Sem cliente</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="titulo" className="rotulo">Título (opcional)</label>
          <input id="titulo" name="titulo" className="campo" maxLength={160} placeholder="Gerado automaticamente" />
        </div>
        <button className="btn-primario w-full">Criar checklist</button>
      </form>
    </div>
  );
}
