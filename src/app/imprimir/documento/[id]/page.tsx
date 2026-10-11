import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BotaoImprimir } from "@/components/BotaoImprimir";
import { DocumentoView } from "@/components/DocumentoView";
import { FolhaA4, Timbre } from "@/components/Timbre";
import { exigirUsuario } from "@/lib/auth/dal";
import { buscarDocumento, dataHora } from "@/lib/dados";
import { buscarModelo } from "@/lib/modelos/catalogo";

export const metadata: Metadata = { title: "Documento", robots: { index: false } };
export const instant = false;

export default async function ImprimirDocumento({ params }: PageProps<"/imprimir/documento/[id]">) {
  const { id } = await params;
  const { escritorio } = await exigirUsuario();
  const linha = await buscarDocumento(escritorio.id, id);
  if (!linha) notFound();
  const modelo = buscarModelo(linha.documento.modelo);
  if (!modelo) notFound();

  return (
    <FolhaA4 botao={<BotaoImprimir />}>
      <Timbre escritorio={escritorio} data={dataHora(linha.documento.criadoEm)} />
      <div className="mt-8">
        <DocumentoView documento={modelo.gerar({ escritorio, v: linha.documento.campos as Record<string, unknown> })} />
      </div>
    </FolhaA4>
  );
}
