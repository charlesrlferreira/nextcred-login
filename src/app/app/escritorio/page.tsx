import type { Metadata } from "next";
import { exigirUsuario } from "@/lib/auth/dal";
import { FormularioEscritorio } from "./FormularioEscritorio";

export const metadata: Metadata = { title: "Meu escritório" };

export default async function MeuEscritorio({ searchParams }: PageProps<"/app/escritorio">) {
  const { escritorio } = await exigirUsuario();
  const { bemvindo } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {bemvindo && (
        <div className="rounded-2xl border border-destaque/30 bg-destaque-claro p-5 text-destaque-escuro">
          <p className="font-semibold">Conta criada! Bem-vindo à Tag Brasil.</p>
          <p className="text-sm">Cadastre os dados do escritório: eles aparecem no cabeçalho de todos os PDFs.</p>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Meu escritório</h1>
        <p className="text-slate-600">Identidade usada nos documentos entregues aos clientes.</p>
      </div>
      <FormularioEscritorio
        inicial={{
          nome: escritorio.nome,
          cnpj: escritorio.cnpj ?? "",
          crc: escritorio.crc ?? "",
          responsavel: escritorio.responsavel ?? "",
          telefone: escritorio.telefone ?? "",
          email: escritorio.email ?? "",
          endereco: escritorio.endereco ?? "",
          logo: escritorio.logo ?? "",
        }}
      />
    </div>
  );
}
