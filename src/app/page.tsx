import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AREAS, FERRAMENTAS } from "@/lib/ferramentas/registro";

const PASSOS = [
  { titulo: "Escolha a ferramenta", texto: "Rescisão, férias, DAS, Fator R, comparativo de regimes, honorários e mais." },
  { titulo: "Preencha os dados", texto: "O cálculo roda no servidor com as tabelas vigentes e mostra cada etapa." },
  { titulo: "Entregue ao cliente", texto: "Gere o PDF A4 com o logo do seu escritório ou cole o resultado no Word." },
];

const RECURSOS = [
  { titulo: "Memória de cálculo", texto: "Cada resultado mostra o passo a passo para conferência e homologação." },
  { titulo: "Base legal citada", texto: "Lei, artigo e norma que sustentam o cálculo aparecem junto do resultado." },
  { titulo: "Tabelas centralizadas", texto: "INSS, IRRF, Simples e presunções revisados em um só lugar para todas as ferramentas." },
  { titulo: "Sua marca no PDF", texto: "Logo, CNPJ, CRC e contato do escritório no cabeçalho de cada documento." },
  { titulo: "Histórico por cliente", texto: "Cada cálculo fica salvo e vinculado ao cliente. Reabra, duplique e ajuste." },
  { titulo: "Entrada sem senha", texto: "Acesso por código enviado ao e-mail. Nada de senha para esquecer ou vazar." },
];

const EM_BREVE = [
  "Checklists de rotinas por departamento",
  "Modelos de contratos, propostas e declarações",
  "Guias de consulta com a base legal",
  "Módulo condominial: rateio, previsão orçamentária e prestação de contas",
  "Módulo de terceirização: custo de posto e repactuação",
  "Assistente com IA para comunicados e pareceres",
];

const FAQ = [
  {
    p: "Preciso instalar alguma coisa?",
    r: "Não. Funciona no navegador do computador, tablet e celular. No celular, adicione à tela inicial para abrir como aplicativo.",
  },
  {
    p: "Como as tabelas são atualizadas?",
    r: "Alíquotas, faixas e tetos ficam em um cadastro central. Quando a lei muda, a atualização vale na hora para todas as ferramentas.",
  },
  {
    p: "Posso conferir o cálculo?",
    r: "Sim. Todo resultado traz a memória de cálculo e a base legal, para você revisar antes de enviar ao cliente.",
  },
  {
    p: "Meus dados ficam seguros?",
    r: "Os cálculos ficam na sua conta, separados por escritório, com acesso por código de uso único no e-mail.",
  },
];

export default function Inicio() {
  return (
    <div className="bg-white">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" aria-label="Tag Brasil — início">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#ferramentas" className="hover:text-marca">Ferramentas</a>
            <a href="#como-funciona" className="hover:text-marca">Como funciona</a>
            <a href="#duvidas" className="hover:text-marca">Dúvidas</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/entrar" className="btn-secundario hidden sm:inline-flex">Entrar</Link>
            <Link href="/entrar" className="btn-primario">Começar agora</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-marca text-white">
          <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_80%_20%,#13a05a_0,transparent_45%)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
            <div>
              <p className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200">
                Para contadores e escritórios contábeis
              </p>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Cálculos contábeis certos, com a lei do lado e a sua marca no PDF.
              </h1>
              <p className="mt-5 text-lg text-slate-200">
                Rescisões, férias, Simples Nacional, comparativo de regimes, pró-labore e honorários. Resultado em segundos, com
                memória de cálculo e base legal para entregar ao cliente.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/entrar" className="btn-primario px-6 py-3 text-base">Criar conta grátis</Link>
                <a href="#ferramentas" className="btn border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10">
                  Ver ferramentas
                </a>
              </div>
              <ul className="mt-8 grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
                <li>✓ Tabelas de 2026 já aplicadas</li>
                <li>✓ Logo do escritório nos documentos</li>
                <li>✓ Computador, tablet e celular</li>
                <li>✓ Histórico salvo por cliente</li>
              </ul>
            </div>
            <div className="cartao mx-auto w-full max-w-md p-6 text-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <Logo className="scale-90" />
                <span className="text-xs text-slate-500">PDF A4</span>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase text-slate-500">Calculadora de Rescisão</p>
              <p className="text-sm text-slate-600">Dispensa sem justa causa · 2 anos e 5 meses</p>
              <div className="mt-4 rounded-xl bg-destaque-claro p-4">
                <p className="text-xs text-destaque-escuro">Total de verbas rescisórias</p>
                <p className="text-3xl font-bold text-destaque-escuro">R$ 10.183,33</p>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                {[
                  ["Saldo de salário (20 dias)", "R$ 2.000,00"],
                  ["Aviso prévio indenizado (36 dias)", "R$ 3.600,00"],
                  ["13º proporcional (9/12)", "R$ 2.250,00"],
                  ["Férias proporcionais + 1/3", "R$ 2.333,33"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-dashed border-slate-100 pb-2">
                    <dt className="text-slate-600">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-slate-500">Memória de cálculo · Base legal por artigo · Tabelas vigentes</p>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold text-marca">Do dado ao PDF em 3 passos</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PASSOS.map((p, i) => (
              <div key={p.titulo} className="cartao p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-marca text-lg font-bold text-white">{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{p.titulo}</h3>
                <p className="mt-2 text-slate-600">{p.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="ferramentas" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold text-marca">{FERRAMENTAS.length} ferramentas prontas para usar</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
              Começamos pelas rotinas que mais pesam no escritório. Novas ferramentas entram todo mês, sem custo adicional.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {AREAS.map((area) => (
                <div key={area} className="cartao p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-destaque-escuro">{area}</h3>
                  <ul className="mt-4 space-y-4">
                    {FERRAMENTAS.filter((f) => f.area === area).map((f) => (
                      <li key={f.slug}>
                        <Link href={`/app/ferramentas/${f.slug}`} className="group block">
                          <span className="font-semibold text-slate-900 group-hover:text-marca">{f.nome} →</span>
                          <span className="block text-sm text-slate-600">{f.resumo}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold text-marca">Feito para a rotina do contador</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RECURSOS.map((r) => (
              <div key={r.titulo} className="rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900">{r.titulo}</h3>
                <p className="mt-2 text-sm text-slate-600">{r.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-marca-claro py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-3xl font-bold text-marca">O que vem por aí</h2>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {EM_BREVE.map((item) => (
                <li key={item} className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                  <span className="mr-2 text-destaque">●</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="duvidas" className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold text-marca">Perguntas frequentes</h2>
          <div className="mt-10 space-y-3">
            {FAQ.map((f) => (
              <details key={f.p} className="cartao group p-5">
                <summary className="cursor-pointer list-none font-semibold text-slate-900">
                  <span className="mr-2 inline-block text-destaque transition-transform group-open:rotate-45">+</span>
                  {f.p}
                </summary>
                <p className="mt-3 text-slate-600">{f.r}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-marca py-16 text-center text-white">
          <h2 className="text-3xl font-bold">Resolva hoje o cálculo que está na sua mesa</h2>
          <p className="mt-3 text-slate-200">Crie a conta em um minuto, só com o seu e-mail.</p>
          <Link href="/entrar" className="btn-primario mt-8 px-8 py-3 text-base">Criar conta e começar</Link>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row">
          <Logo />
          <p>© {2026} Tag Brasil. Administração condominial, contabilidade e facilities.</p>
        </div>
      </footer>
    </div>
  );
}
