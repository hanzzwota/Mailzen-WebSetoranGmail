import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const auth = req.headers.get("authorization");
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { to, subject, html } = await req.json();
  if (!Array.isArray(to) || !to.length || typeof subject !== "string" || typeof html !== "string") {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!apiKey || !from) return Response.json({ error: "Resend belum dikonfigurasi" }, { status: 503 });
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to, subject, html }) });
  const data = await response.json();
  return Response.json(data, { status: response.status });
});
