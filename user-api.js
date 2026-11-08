import { getSupabase } from "./supabase-config.js";

const inflight = new Map();
const perf = [];
const measure = (name, start, ok) => { perf.push({ name, ms: Math.round(performance.now() - start), ok, at: new Date().toISOString() }); if (perf.length > 100) perf.shift(); window.mailzenPerformance = perf; };
async function read(name, query) {
  if (inflight.has(name)) return inflight.get(name);
  const start = performance.now();
  const promise = query().then(({ data, error }) => { if (error) throw error; measure(name, start, true); return data; }).catch((error) => { measure(name, start, false); throw error; }).finally(() => inflight.delete(name));
  inflight.set(name, promise); return promise;
}
const requireUser = async () => { const sb = await getSupabase(); const { data: { user }, error } = await sb.auth.getUser(); if (error || !user) throw new Error("Sesi login tidak ditemukan."); return user; };
export const friendlyError = (e) => e?.message || "Terjadi kesalahan. Silakan coba lagi.";
export const currentUser = requireUser;

export async function getProfile() { const sb = await getSupabase(); const user = await requireUser(); return read(`profile:${user.id}`, () => sb.from("profiles").select("*").eq("id", user.id).single()); }
export async function getConfig() { const sb = await getSupabase(); return read("settings", () => sb.from("system_settings").select("setting_key,setting_value").eq("is_public", true)); }
export function configMap(rows = []) { return Object.fromEntries(rows.map(x => [x.setting_key, x.setting_value])); }
export async function getAnnouncements() { const sb = await getSupabase(); return read("announcements", () => sb.from("announcements").select("*").eq("is_active", true).order("sort_order")); }
export async function getSubmissions() { const sb = await getSupabase(); const user = await requireUser(); return read(`submissions:${user.id}`, () => sb.from("email_submissions").select("*").eq("user_id", user.id).order("created_at", { ascending: false })); }
export async function getTransactions() { const sb = await getSupabase(); const user = await requireUser(); return read(`transactions:${user.id}`, () => sb.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false })); }
export async function submitEmails(emails) { const sb = await getSupabase(); const user = await requireUser(); const clean = [...new Set(emails.map(x => x.trim().toLowerCase()).filter(x => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)))]; if (!clean.length) throw new Error("Masukkan minimal satu alamat email yang valid."); const { data, error } = await sb.rpc("submit_email_addresses", { p_emails: clean }); if (error) throw error; return data; }
export async function createWithdrawal(amount, walletName, walletNumber) { const sb = await getSupabase(); await requireUser(); const { data, error } = await sb.rpc("create_withdrawal", { p_amount: amount, p_wallet_name: walletName, p_wallet_number: walletNumber }); if (error) throw error; return data; }
export async function uploadAvatar(file) { const sb = await getSupabase(); const user = await requireUser(); if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) throw new Error("Foto harus berupa gambar maksimal 2 MB."); const path = `${user.id}/${crypto.randomUUID()}.${file.name.split(".").pop()}`; const { error } = await sb.storage.from("avatars").upload(path, file, { upsert: true }); if (error) throw error; const { data } = sb.storage.from("avatars").getPublicUrl(path); await sb.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id); return data.publicUrl; }
export function subscribeToUserChanges(callback) { let channel; getSupabase().then(sb => { channel = sb.channel("mailzen-user-sync").on("postgres_changes", { event: "*", schema: "public" }, callback).subscribe(); }); return () => channel?.unsubscribe(); }
