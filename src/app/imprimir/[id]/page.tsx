import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultadoView } from "@/components/ResultadoView";
import { FolhaA4, Timbre } from "@/components/Timbre";
import { exigirUsuario } from "@/lib/auth/dal";
import type { Resultado } from "@/lib/calc/tipos";
import { buscarCalculo, dataHora } from "@/lib/dados";
import { resumoEntrada } from "@/lib/ferramentas/exibir";
import { buscarFerramenta } from "@/lib/ferramentas/registro";
import { BotaoImprimir } from "@/components/BotaoImprimir";

export const metadata: Metadata = { title: "Documento", robots: { index: false } };

export const instant = false;

export default async function Imprimir({ params }: PageProps<"/imprimir/[id]">) {
  const { id } = await params;
  const { escritorio } = await exigirUsuario();
  const linha = await buscarCalculo(escritorio.id, id);
  if (!linha) notFound();
  const { calculo, clienteNome, clienteDocumento } = linha;
  const ferramenta = buscarFerramenta(calculo.ferramenta);

  return (
    <FolhaA4 botao={<BotaoImprimir />}>
      <Timbre escritorio={escritorio} data={dataHora(calculo.criadoEm)} />

      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-destaque-escuro">{ferramenta?.nome}</p>
        <h1 className="mt-1 text-xl font-bold">{calculo.titulo}</h1>
        {clienteNome && (
          <p className="mt-1 text-sm text-slate-600">
            Cliente: <strong>{clienteNome}</strong>
            {clienteDocumento ? ` · ${clienteDocumento}` : ""}
          </p>
        )}
      </section>

      {ferramenta && (
        <section className="mt-5 rounded-xl border border-slate-200 p-4 break-inside-avoid">
          <h2 className="mb-2 text-sm font-semibold">Dados informados</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {resumoEntrada(ferramenta, calculo.entrada as Record<string, unknown>).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-dashed border-slate-100 pb-1">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-5">
        <ResultadoView resultado={calculo.resultado as Resultado} compacto />
      </section>

      <footer className="mt-8 border-t border-slate-200 pt-3 text-[10px] leading-relaxed text-slate-500">
        Cálculo de caráter informativo, elaborado com base na legislação vigente na data de emissão e nos dados informados.
        {escritorio.responsavel ? ` Responsável técnico: ${escritorio.responsavel}${escritorio.crc ? ` (CRC ${escritorio.crc})` : ""}.` : ""}
        {" "}Gerado com Tag Brasil.
      </footer>
    </FolhaA4>
  );
}
