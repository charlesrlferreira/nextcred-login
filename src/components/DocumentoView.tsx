import type { Documento } from "@/lib/modelos/tipos";

/** Documento gerado a partir de um modelo. Sem hooks: serve para prévia, tela e impressão. */
export function DocumentoView({ documento }: { documento: Documento }) {
  let numeroClausula = 0;
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-slate-900 print:text-[12pt]">
      <h1 className="text-center text-lg font-bold uppercase tracking-wide">{documento.titulo}</h1>
      {documento.blocos.map((b, i) => {
        switch (b.tipo) {
          case "titulo":
            return <h2 key={i} className="pt-2 font-bold">{b.texto}</h2>;
          case "paragrafo":
            return <p key={i} className="text-justify">{b.texto}</p>;
          case "clausula":
            numeroClausula++;
            return (
              <section key={i} className="space-y-2">
                <h2 className="font-bold uppercase">Cláusula {numeroClausula}ª — {b.titulo}</h2>
                {b.paragrafos.map((p, j) => <p key={j} className="text-justify">{p}</p>)}
              </section>
            );
          case "lista":
            return (
              <ul key={i} className="list-disc space-y-1 pl-6">
                {b.itens.map((item, j) => <li key={j}>{item.replace(/^(\d+\.|•)\s*/, "")}</li>)}
              </ul>
            );
          case "local_data":
            return <p key={i} className="pt-4 text-right">{b.texto}</p>;
          case "assinaturas":
            return (
              <div key={i} className="grid gap-10 pt-12 sm:grid-cols-2 print:grid-cols-2">
                {b.partes.map((p, j) => (
                  <div key={j} className="break-inside-avoid border-t border-slate-800 pt-2 text-center text-sm">
                    <p className="font-semibold">{p.nome}</p>
                    {p.qualificacao && <p className="text-slate-600">{p.qualificacao}</p>}
                  </div>
                ))}
              </div>
            );
        }
      })}
    </div>
  );
}
