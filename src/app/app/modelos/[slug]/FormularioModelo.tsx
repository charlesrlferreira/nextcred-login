"use client";

import { useActionState, useMemo, useState } from "react";
import { CampoFormulario, valorPadrao } from "@/components/CampoFormulario";
import { DocumentoView } from "@/components/DocumentoView";
import type { Campo } from "@/lib/campos";
import { campoVisivel, parseNumeroBr } from "@/lib/ferramentas/entrada";
import { buscarModelo } from "@/lib/modelos/catalogo";
import type { DadosEscritorio, Documento } from "@/lib/modelos/tipos";
import type { EstadoDocumento } from "../acoes";

type ClienteResumo = { id: string; nome: string; documento: string | null; email: string | null };

type Props = {
  slug: string;
  acao: (estado: EstadoDocumento, form: FormData) => Promise<EstadoDocumento>;
  iniciais: Record<string, string>;
  clienteInicial: string;
  clientes: ClienteResumo[];
  escritorio: DadosEscritorio;
};

/** Converte os textos do formulário em valores para a prévia, sem bloquear campos incompletos. */
function valoresPrevia(campos: Campo[], textos: Record<string, string>): Record<string, unknown> {
  const v: Record<string, unknown> = {};
  for (const c of campos) {
    const t = (textos[c.nome] ?? "").trim();
    if (c.tipo === "sim_nao") v[c.nome] = t === "true";
    else if (!t) v[c.nome] = undefined;
    else if (c.tipo === "moeda" || c.tipo === "numero" || c.tipo === "inteiro" || c.tipo === "percentual") v[c.nome] = parseNumeroBr(t) ?? undefined;
    else v[c.nome] = t;
  }
  return v;
}

function dadoDoCliente(c: ClienteResumo | undefined, campo: Campo): string | null {
  if (!c || !campo.preencherDe) return null;
  if (campo.preencherDe === "cliente.nome") return c.nome;
  if (campo.preencherDe === "cliente.documento") return c.documento ?? "";
  return c.email ?? "";
}

export function FormularioModelo({ slug, acao, iniciais, clienteInicial, clientes, escritorio }: Props) {
  const modelo = buscarModelo(slug)!;
  const [estado, enviar, salvando] = useActionState(acao, {});
  const [clienteId, setClienteId] = useState(clienteInicial);
  const [valores, setValores] = useState<Record<string, string>>(() => {
    const cliente = clientes.find((c) => c.id === clienteInicial);
    return Object.fromEntries(
      modelo.campos.map((c) => [c.nome, iniciais[c.nome] ?? dadoDoCliente(cliente, c) ?? valorPadrao(c)]),
    );
  });

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

  function escolherCliente(id: string) {
    setClienteId(id);
    const cliente = clientes.find((c) => c.id === id);
    setValores((v) => {
      const novo = { ...v };
      for (const c of modelo.campos) {
        const dado = dadoDoCliente(cliente, c);
        if (dado !== null) novo[c.nome] = dado;
      }
      return novo;
    });
    setEditados((e) => new Set([...e, ...modelo.campos.filter((c) => c.preencherDe).map((c) => c.nome)]));
  }

  const documento: Documento | null = useMemo(() => {
    try {
      return modelo.gerar({ escritorio, v: valoresPrevia(modelo.campos, valores) });
    } catch {
      return null;
    }
  }, [modelo, escritorio, valores]);

  const visiveis = modelo.campos.filter((c) => campoVisivel(c, valores));
  const secoes = Array.from(new Set(visiveis.map((c) => c.secao ?? "Dados")));

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form action={enviar} className="cartao h-fit space-y-5 p-5" noValidate>
        <div>
          <label htmlFor="clienteId" className="rotulo">Cliente</label>
          <select id="clienteId" name="clienteId" value={clienteId} onChange={(e) => escolherCliente(e.target.value)} className="campo">
            <option value="">Sem cliente</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <p className="mt-1 text-xs text-slate-500">Preenche nome e documento automaticamente.</p>
        </div>

        {secoes.map((secao) => (
          <fieldset key={secao} className="space-y-4 border-t border-slate-100 pt-4">
            <legend className="pr-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{secao}</legend>
            {visiveis.filter((c) => (c.secao ?? "Dados") === secao).map((c) => (
              <CampoFormulario key={c.nome} campo={c} valor={valores[c.nome] ?? ""} erro={erroDe(c.nome)} onChange={alterar} />
            ))}
          </fieldset>
        ))}

        {estado.erroGeral && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{estado.erroGeral}</p>}
        <button className="btn-primario w-full py-3" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar documento"}
        </button>
        <p className="text-center text-xs text-slate-500">Depois de salvar, gere o PDF ou copie para o Word.</p>
      </form>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500">Prévia</p>
        <div className="cartao min-h-96 p-6 sm:p-10">
          {documento ? <DocumentoView documento={documento} /> : <p className="text-slate-500">Preencha os campos para ver a prévia.</p>}
        </div>
      </div>
    </div>
  );
}
