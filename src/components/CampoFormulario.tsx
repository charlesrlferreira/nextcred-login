"use client";

import type { Campo } from "@/lib/campos";

/** Valor inicial do campo no formulário (texto exibido). */
export function valorPadrao(c: Campo): string {
  if (c.padrao === undefined) return "";
  if (c.tipo === "sim_nao") return c.padrao ? "true" : "";
  if (typeof c.padrao === "number") return String(c.padrao).replace(".", ",");
  return String(c.padrao);
}

export function CampoFormulario({
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
  } else if (c.tipo === "texto_longo") {
    controle = (
      <textarea
        id={id}
        name={c.nome}
        value={valor}
        rows={Math.min(8, Math.max(3, valor.split("\n").length + 1))}
        onChange={(e) => onChange(c.nome, e.target.value)}
        className={classe}
        aria-invalid={Boolean(erro)}
      />
    );
  } else if (c.tipo === "texto") {
    controle = (
      <input id={id} name={c.nome} type="text" value={valor} onChange={(e) => onChange(c.nome, e.target.value)} className={classe} aria-invalid={Boolean(erro)} />
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
