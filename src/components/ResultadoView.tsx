import type { Resultado } from "@/lib/calc/tipos";
import { formatarValor } from "@/lib/ferramentas/exibir";

const TONS = {
  positivo: "text-destaque-escuro",
  negativo: "text-red-700",
  neutro: "text-slate-900",
};

/** Exibe o resultado de qualquer ferramenta. Sem hooks: serve para tela, histórico e PDF. */
export function ResultadoView({ resultado, compacto = false }: { resultado: Resultado; compacto?: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
        {resultado.destaques.map((d, i) => (
          <div
            key={i}
            className={
              d.principal
                ? "rounded-xl border border-destaque/30 bg-destaque-claro p-4 sm:col-span-2 lg:col-span-1 print:col-span-1"
                : "rounded-xl border border-slate-200 bg-white p-4"
            }
          >
            <p className={`text-xs font-medium ${d.principal ? "text-destaque-escuro" : "text-slate-500"}`}>{d.rotulo}</p>
            <p className={`mt-1 font-bold ${d.principal ? "text-2xl text-destaque-escuro" : `text-xl ${TONS[d.tom ?? "neutro"]}`}`}>
              {formatarValor(d.valor, d.formato)}
            </p>
          </div>
        ))}
      </div>

      {resultado.tabelas.map((t, ti) => (
        <div key={ti} className="overflow-hidden rounded-xl border border-slate-200 bg-white break-inside-avoid">
          <h3 className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800">{t.titulo}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  {t.colunas.map((c, i) => (
                    <th key={i} className={`px-4 py-2 font-medium ${i === 0 ? "text-left" : "text-right"}`}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.linhas.map((l, li) => (
                  <tr key={li} className="border-b border-slate-100 last:border-0">
                    {l.map((c, i) => (
                      <td key={i} className={`px-4 py-2 ${i === 0 ? "text-left text-slate-700" : "whitespace-nowrap text-right tabular-nums"}`}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {t.total && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                    {t.total.map((c, i) => (
                      <td key={i} className={`px-4 py-2.5 ${i === 0 ? "text-left" : "whitespace-nowrap text-right tabular-nums"}`}>{c}</td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      ))}

      {resultado.alertas.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 break-inside-avoid">
          <h3 className="text-sm font-semibold text-amber-900">Atenção</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {resultado.alertas.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      <div className={`grid gap-4 ${compacto ? "" : "lg:grid-cols-2"} print:grid-cols-1`}>
        <div className="rounded-xl border border-slate-200 bg-white p-4 break-inside-avoid">
          <h3 className="text-sm font-semibold text-slate-800">Memória de cálculo</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
            {resultado.memoria.map((m, i) => <li key={i}>{m}</li>)}
          </ol>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 break-inside-avoid">
          <h3 className="text-sm font-semibold text-slate-800">Base legal</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {resultado.baseLegal.map((b, i) => (
              <li key={i}>
                <span className="font-medium text-marca">{b.norma}</span>
                <span className="block text-slate-600">{b.descricao}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
