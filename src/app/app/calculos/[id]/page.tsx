import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoCopiarWord } from "@/components/BotaoCopiarWord";
import { ResultadoView } from "@/components/ResultadoView";
import { exigirUsuario } from "@/lib/auth/dal";
import type { Resultado } from "@/lib/calc/tipos";
import { buscarCalculo, dataHora } from "@/lib/dados";
import { resumoEntrada } from "@/lib/ferramentas/exibir";
import { buscarFerramenta } from "@/lib/ferramentas/registro";
import { excluirCalculo } from "../acoes";

export const metadata: Metadata = { title: "Cálculo" };

export default async function VerCalculo({ params }: PageProps<"/app/calculos/[id]">) {
  const { id } = await params;
  const { escritorio } = await exigirUsuario();
  const linha = await buscarCalculo(escritorio.id, id);
  if (!linha) notFound();
  const { calculo, clienteNome } = linha;
  const ferramenta = buscarFerramenta(calculo.ferramenta);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link href="/app/calculos" className="hover:text-marca">Histórico</Link> · {ferramenta?.nome ?? calculo.ferramenta}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{calculo.titulo}</h1>
          <p className="text-sm text-slate-600">
            {clienteNome ? `${clienteNome} · ` : ""}Calculado em {dataHora(calculo.criadoEm)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/imprimir/${calculo.id}`} target="_blank" className="btn-marca">Gerar PDF</a>
          <BotaoCopiarWord alvoId="resultado-calculo" />
          {ferramenta && (
            <Link href={`/app/ferramentas/${ferramenta.slug}?de=${calculo.id}`} className="btn-secundario">Duplicar e editar</Link>
          )}
          <form action={excluirCalculo.bind(null, calculo.id)}>
            <button className="btn-perigo">Excluir</button>
          </form>
        </div>
      </div>

      {ferramenta && (
        <div className="cartao p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Dados informados</h2>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {resumoEntrada(ferramenta, calculo.entrada as Record<string, unknown>).map(([k, v]) => (
              <div key={k}>
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div id="resultado-calculo">
        <ResultadoView resultado={calculo.resultado as Resultado} />
      </div>
    </div>
  );
}
