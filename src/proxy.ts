import { NextResponse, type NextRequest } from "next/server";

/**
 * Verificação otimista: sem cookie de sessão, redireciona direto para /entrar.
 * A validação real da sessão continua em exigirUsuario(), em cada página e ação.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("tag_sessao")) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/imprimir/:path*"],
};
