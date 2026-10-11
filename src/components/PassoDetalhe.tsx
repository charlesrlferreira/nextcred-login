import type { Passo } from "@/lib/checklists/catalogo";

/** Prazo, documentos e base legal de um passo de checklist. */
export function PassoDetalhe({ passo }: { passo: Passo }) {
  if (!passo.detalhe && !passo.prazo && !passo.documentos && !passo.baseLegal) return null;
  return (
    <div className="mt-1 space-y-1 text-sm text-slate-600">
      {passo.detalhe && <p>{passo.detalhe}</p>}
      {passo.prazo && (
        <p>
          <span className="font-medium text-amber-700">Prazo:</span> {passo.prazo}
        </p>
      )}
      {passo.documentos && (
        <p>
          <span className="font-medium text-slate-700">Documentos:</span> {passo.documentos.join("; ")}
        </p>
      )}
      {passo.baseLegal && (
        <p>
          <span className="font-medium text-marca">Base legal:</span> {passo.baseLegal}
        </p>
      )}
    </div>
  );
}
