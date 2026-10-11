"use client";

import { useOptimistic, useState, useTransition } from "react";
import { PassoDetalhe } from "@/components/PassoDetalhe";
import type { Passo } from "@/lib/checklists/catalogo";
import { marcarPasso, salvarObservacoes } from "../acoes";

type Props = { id: string; passos: Passo[]; concluidosIniciais: number[]; observacoesIniciais: string };

export function ChecklistInterativo({ id, passos, concluidosIniciais, observacoesIniciais }: Props) {
  const [concluidos, setConcluidos] = useState(concluidosIniciais);
  const [otimista, aplicar] = useOptimistic(concluidos, (atual: number[], { indice, feito }: { indice: number; feito: boolean }) =>
    feito ? [...atual, indice] : atual.filter((i) => i !== indice),
  );
  const [, iniciar] = useTransition();
  const [erro, setErro] = useState("");
  const [obs, setObs] = useState(observacoesIniciais);
  const [estadoObs, setEstadoObs] = useState<"" | "salvando" | "salvo">("");

  const feitos = new Set(otimista);
  const pctFeito = Math.round((feitos.size / passos.length) * 100);

  function alternar(indice: number) {
    const feito = !feitos.has(indice);
    setErro("");
    iniciar(async () => {
      aplicar({ indice, feito });
      try {
        setConcluidos(await marcarPasso(id, indice, feito));
      } catch {
        setErro("Não foi possível salvar. Verifique a conexão e tente de novo.");
      }
    });
  }

  async function gravarObs() {
    if (obs === observacoesIniciais && estadoObs === "") return;
    setEstadoObs("salvando");
    await salvarObservacoes(id, obs);
    setEstadoObs("salvo");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <div className="cartao flex items-center gap-4 p-4">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full transition-all ${pctFeito === 100 ? "bg-destaque" : "bg-marca"}`} style={{ width: `${pctFeito}%` }} />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {feitos.size} de {passos.length} ({pctFeito}%)
          </span>
        </div>
        {erro && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
        <ol className="cartao divide-y divide-slate-100">
          {passos.map((p, i) => {
            const marcado = feitos.has(i);
            return (
              <li key={i} className={`flex gap-4 p-4 ${marcado ? "bg-destaque-claro/40" : ""}`}>
                <input
                  id={`passo-${i}`}
                  type="checkbox"
                  checked={marcado}
                  onChange={() => alternar(i)}
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded accent-destaque"
                />
                <label htmlFor={`passo-${i}`} className="cursor-pointer">
                  <span className={`font-medium ${marcado ? "text-slate-500 line-through" : "text-slate-900"}`}>
                    {i + 1}. {p.titulo}
                  </span>
                  <PassoDetalhe passo={p} />
                </label>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="cartao h-fit space-y-3 p-5 lg:sticky lg:top-32">
        <label htmlFor="observacoes" className="font-semibold text-slate-900">Observações</label>
        <textarea
          id="observacoes"
          value={obs}
          onChange={(e) => { setObs(e.target.value); setEstadoObs(""); }}
          onBlur={gravarObs}
          rows={8}
          maxLength={5000}
          className="campo"
          placeholder="Pendências, protocolos, contatos…"
        />
        <p className="text-xs text-slate-500">{estadoObs === "salvando" ? "Salvando…" : estadoObs === "salvo" ? "Observações salvas." : "Salva ao sair do campo."}</p>
      </div>
    </div>
  );
}
