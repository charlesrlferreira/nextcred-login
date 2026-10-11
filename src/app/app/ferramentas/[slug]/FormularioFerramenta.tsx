"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { BotaoCopiarWord } from "@/components/BotaoCopiarWord";
import { ResultadoView } from "@/components/ResultadoView";
import { CampoFormulario, valorPadrao } from "@/components/CampoFormulario";
import { campoVisivel } from "@/lib/ferramentas/entrada";
import type { Campo } from "@/lib/ferramentas/registro";
import type { EstadoCalculo } from "./acoes";

type Props = {
  acao: (estado: EstadoCalculo, form: FormData) => Promise<EstadoCalculo>;
  campos: Campo[];
  iniciais: Record<string, string>;
  clientes: { id: string; nome: string }[];
  clienteInicial: string;
};

export function FormularioFerramenta({ acao, campos, iniciais, clientes, clienteInicial }: Props) {
  const [estado, enviar, calculando] = useActionState(acao, {});
  const [valores, setValores] = useState<Record<string, string>>(() =>
    Object.fromEntries(campos.map((c) => [c.nome, iniciais[c.nome] ?? valorPadrao(c)])),
  );
  const [clienteId, setClienteId] = useState(clienteInicial);
  const [titulo, setTitulo] = useState("");
  const resultadoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (estado.resultado) resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [estado.resultado]);

  // Esconde o erro de um campo assim que ele é editado; zera a cada nova resposta do servidor.
  const [editados, setEditados] = useState<Set<string>>(new Set());
  const [estadoVisto, setEstadoVisto] = useState(estado);
  if (estado !== estadoVisto) {
    setEstadoVisto(estado);
    setEditados(new Set());
  }
  const erroDe = (nome: string) => (editados.has(nome) ? undefined : estado.erros?.[nome]);

  const alterar = (nome: string, valor: string) => {
    setValores((v) => ({ ...v, [nome]: valor }));
    setEditados((e) => (e.has(nome) ? e : new Set(e).add(nome)));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      <form action={enviar} className="cartao h-fit space-y-4 p-5 xl:sticky xl:top-32" noValidate>
        {campos.filter((c) => campoVisivel(c, valores)).map((c) => (
          <CampoFormulario key={c.nome} campo={c} valor={valores[c.nome] ?? ""} erro={erroDe(c.nome)} onChange={alterar} />
        ))}

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div>
            <label htmlFor="clienteId" className="rotulo">Cliente (opcional)</label>
            <select id="clienteId" name="clienteId" value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="campo">
              <option value="">Sem cliente</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            {clientes.length === 0 && (
              <p className="mt-1 text-xs text-slate-500">
                <Link href="/app/clientes" className="text-marca hover:underline">Cadastre clientes</Link> para vincular os cálculos.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="titulo" className="rotulo">Título no histórico (opcional)</label>
            <input id="titulo" name="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="campo" maxLength={160} placeholder="Gerado automaticamente" />
          </div>
        </div>

        {estado.erroGeral && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{estado.erroGeral}</p>}
        <button className="btn-primario w-full py-3" disabled={calculando}>
          {calculando ? "Calculando…" : "Calcular"}
        </button>
      </form>

      <div ref={resultadoRef} className="scroll-mt-32">
        {estado.resultado && estado.id ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Resultado <span className="text-sm font-normal text-slate-500">· salvo no histórico</span></h2>
              <div className="flex flex-wrap gap-2">
                <a href={`/imprimir/${estado.id}`} target="_blank" className="btn-marca">Gerar PDF</a>
                <BotaoCopiarWord alvoId="resultado-calculo" />
                <Link href={`/app/calculos/${estado.id}`} className="btn-secundario">Abrir no histórico</Link>
              </div>
            </div>
            <div id="resultado-calculo">
              <ResultadoView resultado={estado.resultado} />
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-60 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-500">
            Preencha os dados e clique em <strong className="mx-1 text-slate-700">Calcular</strong>. O resultado aparece aqui, com a memória de cálculo e a base legal.
          </div>
        )}
      </div>
    </div>
  );
}
