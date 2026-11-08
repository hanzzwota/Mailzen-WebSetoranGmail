# MailZen — Setup

## File utama

- `app.html`: SPA user untuk dashboard, setor, riwayat, saldo, dan profil.
- `admin.html`: panel admin terpisah; akses divalidasi oleh role database dan RLS.
- `login.html`: login, register, dan verifikasi OTP Supabase Auth.
- `supabase-config.js`: konfigurasi URL dan anon key publik.
- `user-api.js` / `admin-api.js`: data layer dengan handler terpusat, deduplikasi GET, error handling, refresh, dan RPC.
- `database/schema.sql`: tabel, index, RLS, trigger profile, dan RPC atomik.

## Supabase

1. Buat project Supabase dan aktifkan Email provider pada Authentication.
2. Jalankan seluruh `database/schema.sql` di SQL Editor.
3. Set Site URL ke URL hosting dan tambahkan redirect `login.html`, `app.html`, dan `admin.html` bila diperlukan.
4. Salin URL project dan anon key ke `window.MAILZEN_CONFIG` sebelum script halaman dijalankan, atau ganti nilai placeholder pada `supabase-config.js`.
5. Buat Storage bucket `avatars` (public atau signed URL sesuai kebutuhan) dan tambahkan policy upload/read yang membatasi folder ke `auth.uid()`.

Contoh konfigurasi HTML sebelum module:

```html
<script>window.MAILZEN_CONFIG={supabaseUrl:'https://project.supabase.co',supabaseAnonKey:'eyJ...'};</script>
```

## Admin pertama

1. Daftarkan akun melalui `login.html`.
2. Setelah user dibuat, jalankan SQL berikut sekali dengan email admin yang sudah diverifikasi:

```sql
update public.profiles set role = 'admin' where email = 'admin@contoh.com';
```

Jangan membuat admin dengan pengecekan URL atau JavaScript saja. Fungsi RPC dan RLS juga memeriksa role dari tabel `profiles`.

## Resend

API key Resend tidak boleh berada di browser. Simpan secret di Supabase Edge Function:

```bash
supabase secrets set RESEND_API_KEY=re_xxx RESEND_FROM_EMAIL='MailZen <noreply@domain-terverifikasi.com>'
supabase functions deploy send-mailzen-email
```

`supabase/functions/send-mailzen-email/index.ts` adalah handler dasar untuk notifikasi email. Domain pengirim harus diverifikasi di Resend. Jangan pernah menaruh `RESEND_API_KEY` pada `app.html`, `admin.html`, atau `supabase-config.js`.

## Catatan integrasi

Konfigurasi admin disimpan di `system_settings` dan dibaca user dari sumber yang sama. Nilai default pada SQL hanya fallback awal; setelah admin mengubahnya, user membaca nilai database terbaru. Polling admin berhenti secara efektif ketika tab tidak terlihat dan berjalan tiap 15 detik saat aktif.

Operasi reward, reserve saldo penarikan, approve, reject, dan refund menggunakan RPC PostgreSQL dengan row lock/status check agar tidak diproses dua kali.

## Pengujian

Source sudah divalidasi secara statis dan dapat dijalankan sebagai static site. Pengujian end-to-end (register, OTP, approve/reject, withdrawal, Realtime, dan Resend) membutuhkan project Supabase, domain redirect, Storage bucket, dan kredensial yang belum tersedia di arsip sumber. Karena itu tidak ada klaim bahwa alur produksi sudah live-tested.
