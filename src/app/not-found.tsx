import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NaoEncontrado() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <Logo />
      <h1 className="text-2xl font-bold text-slate-900">Página não encontrada</h1>
      <p className="text-slate-600">O endereço não existe ou o item foi excluído.</p>
      <Link href="/app" className="btn-primario">Voltar ao painel</Link>
    </main>
  );
}
