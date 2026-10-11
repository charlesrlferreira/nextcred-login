"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarCliente, type EstadoCliente } from "./acoes";

export function NovoCliente() {
  const [estado, enviar, salvando] = useActionState<EstadoCliente, FormData>(criarCliente, {});
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (estado.ok) form.current?.reset();
  }, [estado]);

  return (
    <form ref={form} action={enviar} className="cartao h-fit space-y-4 p-5">
      <h2 className="font-semibold text-slate-900">Novo cliente</h2>
      <div>
        <label htmlFor="nome" className="rotulo">Nome ou razão social</label>
        <input id="nome" name="nome" required className="campo" />
      </div>
      <div>
        <label htmlFor="documento" className="rotulo">CNPJ ou CPF</label>
        <input id="documento" name="documento" className="campo" inputMode="numeric" />
      </div>
      <div>
        <label htmlFor="regime" className="rotulo">Regime tributário</label>
        <select id="regime" name="regime" className="campo" defaultValue="">
          <option value="">Não informado</option>
          <option>MEI</option>
          <option>Simples Nacional</option>
          <option>Lucro Presumido</option>
          <option>Lucro Real</option>
          <option>Pessoa física</option>
          <option>Condomínio</option>
        </select>
      </div>
      <div>
        <label htmlFor="email-cliente" className="rotulo">E-mail</label>
        <input id="email-cliente" name="email" type="email" className="campo" />
      </div>
      {estado.erro && <p role="alert" className="text-sm text-red-600">{estado.erro}</p>}
      {estado.ok && <p className="text-sm text-destaque-escuro">Cliente cadastrado.</p>}
      <button className="btn-primario w-full" disabled={salvando}>{salvando ? "Salvando…" : "Cadastrar cliente"}</button>
    </form>
  );
}
