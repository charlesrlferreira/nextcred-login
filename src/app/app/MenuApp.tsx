"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/app", rotulo: "Painel" },
  { href: "/app/ferramentas", rotulo: "Ferramentas" },
  { href: "/app/calculos", rotulo: "Histórico" },
  { href: "/app/clientes", rotulo: "Clientes" },
  { href: "/app/escritorio", rotulo: "Meu escritório" },
];

/** Menu sem item ativo, usado enquanto o caminho atual não está disponível. */
export function MenuLinks({ caminho = "" }: { caminho?: string }) {
  return (
    <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 text-sm">
      {ITENS.map((i) => {
        const ativo = i.href === "/app" ? caminho === "/app" : caminho.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 font-medium ${
              ativo ? "border-destaque text-marca" : "border-transparent text-slate-600 hover:text-marca"
            }`}
          >
            {i.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

export function MenuApp() {
  return <MenuLinks caminho={usePathname()} />;
}
