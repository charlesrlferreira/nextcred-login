"use client";

import { useActionState, useState } from "react";
import { confirmarCodigo, pedirCodigo, type EstadoEntrar } from "./acoes";

const INICIAL: EstadoEntrar = { etapa: "email" };

export function FormularioEntrar() {
  const [estadoEmail, enviarEmail, enviandoEmail] = useActionState(pedirCodigo, INICIAL);
  const [estadoCodigo, enviarCodigo, conferindo] = useActionState(confirmarCodigo, INICIAL);
  const [trocarEmail, setTrocarEmail] = useState(false);

  const naEtapaCodigo = estadoEmail.etapa === "codigo" && !trocarEmail;

  if (!naEtapaCodigo) {
    return (
      <form action={(f) => { setTrocarEmail(false); enviarEmail(f); }} className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Entrar ou criar conta</h1>
          <p className="mt-1 text-sm text-slate-600">Informe seu e-mail e enviaremos um código de acesso. Sem senha.</p>
        </div>
        <div>
          <label htmlFor="email" className="rotulo">E-mail</label>
          <input id="email" name="email" type="email" required autoComplete="email" autoFocus defaultValue={estadoEmail.email} className="campo" placeholder="voce@escritorio.com.br" />
        </div>
        {estadoEmail.erro && <p role="alert" className="text-sm text-red-600">{estadoEmail.erro}</p>}
        <button className="btn-primario w-full" disabled={enviandoEmail}>
          {enviandoEmail ? "Enviando…" : "Receber código"}
        </button>
      </form>
    );
  }

  return (
    <form action={enviarCodigo} className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Digite o código</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enviamos um código de 6 dígitos para <strong>{estadoEmail.email}</strong>. Ele vale por 10 minutos.
        </p>
      </div>
      <input type="hidden" name="email" value={estadoEmail.email} />
      <div>
        <label htmlFor="codigo" className="rotulo">Código de acesso</label>
        <input
          id="codigo"
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          className="campo text-center font-mono text-2xl tracking-[0.5em]"
          placeholder="000000"
        />
      </div>
      {estadoCodigo.erro && <p role="alert" className="text-sm text-red-600">{estadoCodigo.erro}</p>}
      <button className="btn-primario w-full" disabled={conferindo}>
        {conferindo ? "Conferindo…" : "Entrar"}
      </button>
      <button type="button" onClick={() => setTrocarEmail(true)} className="w-full text-sm text-slate-600 hover:text-marca">
        Usar outro e-mail ou reenviar código
      </button>
    </form>
  );
}
