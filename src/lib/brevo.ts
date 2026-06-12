const BREVO_API = "https://api.brevo.com/v3/smtp/email";
const FROM = { name: "Lumora", email: "hello@lumora.helmutfritz.fyi" };

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}

export async function sendEmail({ to, subject, html, headers }: SendEmailParams): Promise<{ error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { error: "BREVO_API_KEY not configured" };

  const res = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: FROM,
      to: [{ email: to }],
      subject,
      htmlContent: html,
      headers,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { error: body };
  }

  return {};
}
