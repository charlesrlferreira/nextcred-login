import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { buscarCalculo, listarClientes } from "@/lib/dados";
import { valoresParaFormulario } from "@/lib/ferramentas/exibir";
import { buscarFerramenta } from "@/lib/ferramentas/registro";
import { calcular } from "./acoes";
import { FormularioFerramenta } from "./FormularioFerramenta";

export async function generateMetadata({ params }: PageProps<"/app/ferramentas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: buscarFerramenta(slug)?.nome ?? "Ferramenta" };
}

export default async function PaginaFerramenta({ params, searchParams }: PageProps<"/app/ferramentas/[slug]">) {
  const { slug } = await params;
  const ferramenta = buscarFerramenta(slug);
  if (!ferramenta) notFound();

  const { escritorio } = await exigirUsuario();
  const { de, cliente } = await searchParams;
  const clientes = await listarClientes(escritorio.id);

  let iniciais: Record<string, string> = {};
  let clienteInicial = typeof cliente === "string" ? cliente : "";
  if (typeof de === "string") {
    const origem = await buscarCalculo(escritorio.id, de);
    if (origem && origem.calculo.ferramenta === slug) {
      iniciais = valoresParaFormulario(ferramenta, origem.calculo.entrada as Record<string, unknown>);
      clienteInicial = origem.calculo.clienteId ?? "";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">
          <Link href="/app/ferramentas" className="hover:text-marca">Ferramentas</Link> · {ferramenta.area}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{ferramenta.nome}</h1>
        <p className="text-slate-600">{ferramenta.resumo}</p>
      </div>
      <FormularioFerramenta
        key={typeof de === "string" ? de : "novo"}
        acao={calcular.bind(null, slug)}
        campos={ferramenta.campos}
        iniciais={iniciais}
        clientes={clientes.map((c) => ({ id: c.id, nome: c.nome }))}
        clienteInicial={clienteInicial}
      />
    </div>
  );
}
