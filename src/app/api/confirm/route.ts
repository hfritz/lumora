import { NextRequest, NextResponse } from "next/server";
import { getDb, isDbConfigured } from "@/lib/db";
import { verifyConfirmToken } from "@/lib/tokens";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(errorPage("Missing confirmation link."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const email = await verifyConfirmToken(token);

  if (!email) {
    return new NextResponse(
      errorPage(
        "This confirmation link has expired or is invalid.",
        "Request a new one by subscribing again.",
        APP_URL
      ),
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.redirect(`${APP_URL}/welcome`);
  }

  const sql = getDb();
  await sql`UPDATE subscribers SET confirmed = true WHERE email = ${email}`;

  return NextResponse.redirect(`${APP_URL}/welcome`);
}

function errorPage(message: string, hint?: string, homeUrl?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Lumora</title>
<style>body{font-family:Georgia,serif;background:#FAF7F2;color:#2C2420;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.box{text-align:center;max-width:400px;padding:40px 24px;}
h1{font-size:28px;font-weight:300;letter-spacing:4px;color:#C9A96E;text-transform:uppercase;margin:0 0 24px;}
p{font-size:16px;color:#7A6B5D;line-height:1.6;margin:0 0 16px;}
a{color:#C9A96E;}</style>
</head>
<body><div class="box">
<h1>Lumora</h1>
<p>${message}</p>
${hint ? `<p>${hint}</p>` : ""}
${homeUrl ? `<p><a href="${homeUrl}">Return home</a></p>` : ""}
</div></body></html>`;
}
