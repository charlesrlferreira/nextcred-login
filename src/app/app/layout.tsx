import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { exigirUsuario } from "@/lib/auth/dal";
import { sair } from "../entrar/acoes";
import { MenuApp, MenuLinks } from "./MenuApp";

async function Conta() {
  const { usuario, escritorio } = await exigirUsuario();
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right text-xs sm:block">
        <p className="font-semibold text-slate-800">{escritorio.nome}</p>
        <p className="text-slate-500">{usuario.email}</p>
      </div>
      <form action={sair}>
        <button className="btn-secundario px-3 py-1.5 text-xs">Sair</button>
      </form>
    </div>
  );
}

// Toda a área logada lê a sessão a cada requisição; não buscamos navegação instantânea aqui.
export const instant = false;

export default function LayoutApp({ children }: LayoutProps<"/app">) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="nao-imprimir sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/app" aria-label="Painel">
            <Logo />
          </Link>
          <Suspense fallback={<div className="h-8 w-40 animate-pulse rounded bg-slate-100" />}>
            <Conta />
          </Suspense>
        </div>
        <Suspense fallback={<MenuLinks />}>
          <MenuApp />
        </Suspense>
      </header>
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:py-8">{children}</div>
    </div>
  );
}
