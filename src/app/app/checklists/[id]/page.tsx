import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { buscarChecklist } from "@/lib/checklists/catalogo";
import { buscarChecklistCliente, dataHora } from "@/lib/dados";
import { excluirChecklist } from "../acoes";
import { ChecklistInterativo } from "./ChecklistInterativo";

export const metadata: Metadata = { title: "Checklist" };

export default async function VerChecklist({ params }: PageProps<"/app/checklists/[id]">) {
  const { id } = await params;
  const { escritorio } = await exigirUsuario();
  const linha = await buscarChecklistCliente(escritorio.id, id);
  if (!linha) notFound();
  const { checklist, clienteNome } = linha;
  const modelo = buscarChecklist(checklist.modelo);
  if (!modelo) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link href="/app/checklists" className="hover:text-marca">Checklists</Link> · {modelo.area}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{checklist.titulo}</h1>
          <p className="text-sm text-slate-600">
            {clienteNome ? `${clienteNome} · ` : ""}Criado em {dataHora(checklist.criadoEm)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/imprimir/checklist/${checklist.id}`} target="_blank" className="btn-marca">Gerar PDF</a>
          <form action={excluirChecklist.bind(null, checklist.id)}>
            <button className="btn-perigo">Excluir</button>
          </form>
        </div>
      </div>
      <ChecklistInterativo id={checklist.id} passos={modelo.passos} concluidosIniciais={checklist.concluidos} observacoesIniciais={checklist.observacoes ?? ""} />
    </div>
  );
}
