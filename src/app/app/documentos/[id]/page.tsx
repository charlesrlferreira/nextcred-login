import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoCopiarWord } from "@/components/BotaoCopiarWord";
import { DocumentoView } from "@/components/DocumentoView";
import { exigirUsuario } from "@/lib/auth/dal";
import { buscarDocumento, dataHora } from "@/lib/dados";
import { buscarModelo } from "@/lib/modelos/catalogo";
import { excluirDocumento } from "../../modelos/acoes";

export const metadata: Metadata = { title: "Documento" };

export default async function VerDocumento({ params }: PageProps<"/app/documentos/[id]">) {
  const { id } = await params;
  const { escritorio } = await exigirUsuario();
  const linha = await buscarDocumento(escritorio.id, id);
  if (!linha) notFound();
  const { documento, clienteNome } = linha;
  const modelo = buscarModelo(documento.modelo);
  if (!modelo) notFound();
  const gerado = modelo.gerar({ escritorio, v: documento.campos as Record<string, unknown> });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link href="/app/modelos" className="hover:text-marca">Modelos</Link> · {modelo.nome}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{documento.titulo}</h1>
          <p className="text-sm text-slate-600">
            {clienteNome ? `${clienteNome} · ` : ""}Criado em {dataHora(documento.criadoEm)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/imprimir/documento/${documento.id}`} target="_blank" className="btn-marca">Gerar PDF</a>
          <BotaoCopiarWord alvoId="documento-gerado" />
          <Link href={`/app/modelos/${modelo.slug}?de=${documento.id}`} className="btn-secundario">Duplicar e editar</Link>
          <form action={excluirDocumento.bind(null, documento.id)}>
            <button className="btn-perigo">Excluir</button>
          </form>
        </div>
      </div>
      <div id="documento-gerado" className="cartao mx-auto max-w-4xl p-6 sm:p-12">
        <DocumentoView documento={gerado} />
      </div>
    </div>
  );
}
