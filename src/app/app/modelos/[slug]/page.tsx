import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/dal";
import { buscarDocumento, listarClientes } from "@/lib/dados";
import { valoresParaFormulario } from "@/lib/ferramentas/exibir";
import { buscarModelo } from "@/lib/modelos/catalogo";
import { salvarDocumento } from "../acoes";
import { FormularioModelo } from "./FormularioModelo";

export async function generateMetadata({ params }: PageProps<"/app/modelos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: buscarModelo(slug)?.nome ?? "Modelo" };
}

export default async function PaginaModelo({ params, searchParams }: PageProps<"/app/modelos/[slug]">) {
  const { slug } = await params;
  const modelo = buscarModelo(slug);
  if (!modelo) notFound();
  const { escritorio } = await exigirUsuario();
  const clientes = await listarClientes(escritorio.id);
  const { de, cliente } = await searchParams;

  let iniciais: Record<string, string> = {};
  let clienteInicial = typeof cliente === "string" ? cliente : "";
  if (typeof de === "string") {
    const origem = await buscarDocumento(escritorio.id, de);
    if (origem && origem.documento.modelo === slug) {
      iniciais = valoresParaFormulario(modelo, origem.documento.campos as Record<string, unknown>);
      clienteInicial = origem.documento.clienteId ?? "";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">
          <Link href="/app/modelos" className="hover:text-marca">Modelos</Link> · {modelo.categoria}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{modelo.nome}</h1>
        <p className="text-slate-600">{modelo.resumo}</p>
      </div>
      <FormularioModelo
        key={typeof de === "string" ? de : "novo"}
        slug={slug}
        acao={salvarDocumento.bind(null, slug)}
        iniciais={iniciais}
        clienteInicial={clienteInicial}
        clientes={clientes.map((c) => ({ id: c.id, nome: c.nome, documento: c.documento, email: c.email }))}
        escritorio={{
          nome: escritorio.nome,
          cnpj: escritorio.cnpj,
          crc: escritorio.crc,
          responsavel: escritorio.responsavel,
          endereco: escritorio.endereco,
          email: escritorio.email,
          telefone: escritorio.telefone,
        }}
      />
    </div>
  );
}
