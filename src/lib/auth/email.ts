import "server-only";

/** Envia o código de acesso. Sem RESEND_API_KEY, registra no console (desenvolvimento). */
export async function enviarCodigo(email: string, codigo: string): Promise<void> {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    if (process.env.NODE_ENV === "production") throw new Error("RESEND_API_KEY não configurada.");
    console.info(`[dev] Código de acesso para ${email}: ${codigo}`);
    return;
  }
  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_REMETENTE ?? "Tag Brasil <onboarding@resend.dev>",
      to: email,
      subject: `${codigo} é o seu código de acesso à Tag Brasil`,
      text: `Seu código de acesso é ${codigo}. Ele vale por 10 minutos.\n\nSe você não pediu este código, ignore este e-mail.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0f172a">
<h2 style="margin:0 0 16px">Tag Brasil</h2>
<p>Use o código abaixo para entrar. Ele vale por 10 minutos.</p>
<p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:24px 0">${codigo}</p>
<p style="color:#64748b;font-size:13px">Se você não pediu este código, ignore este e-mail.</p></div>`,
    }),
  });
  if (!resposta.ok) throw new Error(`Falha no envio do e-mail (${resposta.status}).`);
}
