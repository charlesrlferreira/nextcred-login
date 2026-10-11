"use client";

import { useActionState, useState } from "react";
import { salvarEscritorio, type EstadoEscritorio } from "./acoes";

type Dados = Record<"nome" | "cnpj" | "crc" | "responsavel" | "telefone" | "email" | "endereco" | "logo", string>;

const CAMPOS: { nome: keyof Dados; rotulo: string; largo?: boolean }[] = [
  { nome: "nome", rotulo: "Nome do escritório", largo: true },
  { nome: "cnpj", rotulo: "CNPJ" },
  { nome: "crc", rotulo: "CRC" },
  { nome: "responsavel", rotulo: "Contador responsável" },
  { nome: "telefone", rotulo: "Telefone / WhatsApp" },
  { nome: "email", rotulo: "E-mail de contato" },
  { nome: "endereco", rotulo: "Endereço", largo: true },
];

/** Reduz a imagem para no máximo 480 × 160 px antes de enviar. */
async function redimensionar(arquivo: File): Promise<string> {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const escala = Math.min(1, 480 / img.width, 160 / img.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function FormularioEscritorio({ inicial }: { inicial: Dados }) {
  const [estado, enviar, salvando] = useActionState<EstadoEscritorio, FormData>(salvarEscritorio, {});
  const [dados, setDados] = useState(inicial);
  const [logoNovo, setLogoNovo] = useState("");
  const [remover, setRemover] = useState(false);
  const [erroLogo, setErroLogo] = useState("");
  const logoAtual = remover ? "" : logoNovo || inicial.logo;

  async function escolherLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    setErroLogo("");
    if (!arquivo) return;
    if (!/^image\/(png|jpeg|webp)$/.test(arquivo.type)) {
      setErroLogo("Use uma imagem PNG, JPG ou WebP.");
      return;
    }
    try {
      setLogoNovo(await redimensionar(arquivo));
      setRemover(false);
    } catch {
      setErroLogo("Não foi possível ler a imagem.");
    }
  }

  return (
    <form action={enviar} className="cartao space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-2 sm:w-60">
          {logoAtual ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoAtual} alt="Logo do escritório" className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-sm text-slate-400">Sem logo</span>
          )}
        </div>
        <div className="space-y-2">
          <label className="btn-secundario cursor-pointer">
            Escolher logo
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={escolherLogo} />
          </label>
          {logoAtual && (
            <button type="button" onClick={() => { setRemover(true); setLogoNovo(""); }} className="block text-sm text-red-600 hover:underline">
              Remover logo
            </button>
          )}
          <p className="text-xs text-slate-500">PNG com fundo transparente fica melhor no PDF.</p>
          {erroLogo && <p className="text-xs text-red-600">{erroLogo}</p>}
        </div>
      </div>
      <input type="hidden" name="logo" value={logoNovo} />
      <input type="hidden" name="removerLogo" value={remover ? "1" : ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        {CAMPOS.map((c) => (
          <div key={c.nome} className={c.largo ? "sm:col-span-2" : ""}>
            <label htmlFor={c.nome} className="rotulo">{c.rotulo}</label>
            <input
              id={c.nome}
              name={c.nome}
              value={dados[c.nome]}
              onChange={(e) => setDados((d) => ({ ...d, [c.nome]: e.target.value }))}
              className="campo"
              required={c.nome === "nome"}
            />
          </div>
        ))}
      </div>

      {estado.erro && <p role="alert" className="text-sm text-red-600">{estado.erro}</p>}
      {estado.ok && <p className="text-sm font-medium text-destaque-escuro">Dados salvos.</p>}
      <button className="btn-primario" disabled={salvando}>{salvando ? "Salvando…" : "Salvar dados do escritório"}</button>
    </form>
  );
}
