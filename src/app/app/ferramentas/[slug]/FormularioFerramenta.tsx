"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { BotaoCopiarWord } from "@/components/BotaoCopiarWord";
import { ResultadoView } from "@/components/ResultadoView";
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

function valorPadrao(c: Campo): string {
  if (c.padrao === undefined) return "";
  if (c.tipo === "sim_nao") return c.padrao ? "true" : "";
  return String(c.padrao).replace(".", ",");
}

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

  const alterar = (nome: string, valor: string) => setValores((v) => ({ ...v, [nome]: valor }));

  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      <form action={enviar} className="cartao h-fit space-y-4 p-5 xl:sticky xl:top-32" noValidate>
        {campos.filter((c) => campoVisivel(c, valores)).map((c) => (
          <CampoFormulario key={c.nome} campo={c} valor={valores[c.nome] ?? ""} erro={estado.erros?.[c.nome]} onChange={alterar} />
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

function CampoFormulario({
  campo: c,
  valor,
  erro,
  onChange,
}: {
  campo: Campo;
  valor: string;
  erro?: string;
  onChange: (nome: string, valor: string) => void;
}) {
  const id = `campo-${c.nome}`;
  const classe = `campo ${erro ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`;
  const ajuda = erro ? (
    <p className="mt-1 text-xs text-red-600">{erro}</p>
  ) : c.ajuda ? (
    <p className="mt-1 text-xs text-slate-500">{c.ajuda}</p>
  ) : null;

  if (c.tipo === "sim_nao") {
    return (
      <div>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name={c.nome}
            value="true"
            checked={valor === "true"}
            onChange={(e) => onChange(c.nome, e.target.checked ? "true" : "")}
            className="h-4 w-4 rounded border-slate-300 accent-destaque"
          />
          {c.rotulo}
        </label>
        {ajuda}
      </div>
    );
  }

  let controle: React.ReactNode;
  if (c.tipo === "selecao") {
    controle = (
      <select id={id} name={c.nome} value={valor} onChange={(e) => onChange(c.nome, e.target.value)} className={classe}>
        {c.opcoes?.map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
      </select>
    );
  } else if (c.tipo === "data") {
    controle = <input id={id} name={c.nome} type="date" value={valor} onChange={(e) => onChange(c.nome, e.target.value)} className={classe} />;
  } else {
    const prefixo = c.tipo === "moeda" ? "R$" : null;
    const sufixo = c.tipo === "percentual" ? "%" : null;
    controle = (
      <div className="relative">
        {prefixo && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">{prefixo}</span>}
        <input
          id={id}
          name={c.nome}
          type="text"
          inputMode={c.tipo === "inteiro" ? "numeric" : "decimal"}
          value={valor}
          onChange={(e) => onChange(c.nome, e.target.value)}
          className={`${classe} ${prefixo ? "pl-10" : ""} ${sufixo ? "pr-8" : ""} tabular-nums`}
          placeholder={c.tipo === "moeda" ? "0,00" : "0"}
          aria-invalid={Boolean(erro)}
        />
        {sufixo && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">{sufixo}</span>}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="rotulo">{c.rotulo}</label>
      {controle}
      {ajuda}
    </div>
  );
}
