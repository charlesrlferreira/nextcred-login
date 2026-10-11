import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultadoView } from "@/components/ResultadoView";
import { exigirUsuario } from "@/lib/auth/dal";
import type { Resultado } from "@/lib/calc/tipos";
import { buscarCalculo, dataHora } from "@/lib/dados";
import { resumoEntrada } from "@/lib/ferramentas/exibir";
import { buscarFerramenta } from "@/lib/ferramentas/registro";
import { BotaoImprimir } from "./BotaoImprimir";

export const metadata: Metadata = { title: "Documento", robots: { index: false } };

export const instant = false;

export default async function Imprimir({ params }: PageProps<"/imprimir/[id]">) {
  const { id } = await params;
  const { escritorio } = await exigirUsuario();
  const linha = await buscarCalculo(escritorio.id, id);
  if (!linha) notFound();
  const { calculo, clienteNome, clienteDocumento } = linha;
  const ferramenta = buscarFerramenta(calculo.ferramenta);
  const contato = [escritorio.cnpj && `CNPJ ${escritorio.cnpj}`, escritorio.crc && `CRC ${escritorio.crc}`, escritorio.telefone, escritorio.email]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:bg-white print:py-0">
      <div className="nao-imprimir mx-auto mb-4 flex max-w-[210mm] items-center justify-between gap-4 px-4 print:hidden">
        <p className="text-sm text-slate-700">Use “Salvar como PDF” na janela de impressão.</p>
        <BotaoImprimir />
      </div>
      <article className="mx-auto max-w-[210mm] bg-white p-[14mm] text-slate-900 shadow-xl print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-2 border-marca pb-4">
          <div className="flex items-center gap-4">
            {escritorio.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={escritorio.logo} alt="" className="max-h-16 max-w-48 object-contain" />
            )}
            <div>
              <p className="text-lg font-bold text-marca">{escritorio.nome}</p>
              {contato && <p className="text-xs text-slate-600">{contato}</p>}
              {escritorio.endereco && <p className="text-xs text-slate-600">{escritorio.endereco}</p>}
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Emitido em</p>
            <p className="font-medium text-slate-700">{dataHora(calculo.criadoEm)}</p>
          </div>
        </header>

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
      </article>
    </div>
  );
}
