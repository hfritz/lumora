import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { verifyUnsubscribeToken } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email") ?? "";
  const token = request.nextUrl.searchParams.get("token") ?? "";

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return new NextResponse(page("Invalid unsubscribe link.", false), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    await supabase.from("subscribers").delete().eq("email", email);
  }

  return new NextResponse(page("You've been unsubscribed.", true), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

function page(message: string, success: boolean): string {
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
${success ? "<p>You won't receive any more emails from us.</p>" : ""}
<p><a href="/">Return to Lumora</a></p>
</div></body></html>`;
}
