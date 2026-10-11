"use client";

export function BotaoImprimir() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-marca">
      Imprimir / Salvar PDF
    </button>
  );
}
