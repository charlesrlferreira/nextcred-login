import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { FormularioEntrar } from "./FormularioEntrar";

export const metadata: Metadata = { title: "Entrar" };

export default function Entrar() {
  return (
    <main className="flex flex-1 items-center justify-center bg-marca-claro px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="cartao p-6 sm:p-8">
          <FormularioEntrar />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Ao entrar, você concorda com o tratamento dos seus dados conforme a LGPD para prestação do serviço.
        </p>
      </div>
    </main>
  );
}
