"use client";

import { useState } from "react";

/** Copia o conteúdo de um elemento como HTML, pronto para colar no Word mantendo as tabelas. */
export function BotaoCopiarWord({ alvoId }: { alvoId: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const el = document.getElementById(alvoId);
    if (!el) return;
    const html = `<div style="font-family:Arial,sans-serif;font-size:11pt">${el.innerHTML}</div>`;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([el.innerText], { type: "text/plain" }),
        }),
      ]);
    } catch {
      await navigator.clipboard.writeText(el.innerText);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button type="button" onClick={copiar} className="btn-secundario">
      {copiado ? "Copiado ✓" : "Copiar para o Word"}
    </button>
  );
}
