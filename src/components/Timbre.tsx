import type { Escritorio } from "@/lib/db/schema";

/** Cabeçalho com logo e dados do escritório, usado em todos os documentos impressos. */
export function Timbre({ escritorio, data }: { escritorio: Escritorio; data: string }) {
  const contato = [escritorio.cnpj && `CNPJ ${escritorio.cnpj}`, escritorio.crc && `CRC ${escritorio.crc}`, escritorio.telefone, escritorio.email]
    .filter(Boolean)
    .join(" · ");
  return (
    <header className="flex items-start justify-between gap-6 border-b-2 border-marca pb-4">
      <div className="flex items-center gap-4">
        {escritorio.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={escritorio.logo} alt="" className="max-h-16 max-w-48 object-contain" />
        )}
        <div>
          <p className="text-lg font-bold text-marca">{escritorio.nome}</p>
          {contato && <p className="text-xs text-slate-600">{contato}</p>}
          {escritorio.endereco && <p className="text-xs text-slate-600">{escritorio.endereco}</p>}
        </div>
      </div>
      <div className="text-right text-xs text-slate-500">
        <p>Emitido em</p>
        <p className="font-medium text-slate-700">{data}</p>
      </div>
    </header>
  );
}

/** Moldura A4 com botão de impressão, para as páginas em /imprimir. */
export function FolhaA4({ children, botao }: { children: React.ReactNode; botao: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-200 py-8 print:bg-white print:py-0">
      <div className="nao-imprimir mx-auto mb-4 flex max-w-[210mm] items-center justify-between gap-4 px-4 print:hidden">
        <p className="text-sm text-slate-700">Use “Salvar como PDF” na janela de impressão.</p>
        {botao}
      </div>
      <article className="mx-auto max-w-[210mm] bg-white p-[14mm] text-slate-900 shadow-xl print:max-w-none print:p-0 print:shadow-none">
        {children}
      </article>
    </div>
  );
}
