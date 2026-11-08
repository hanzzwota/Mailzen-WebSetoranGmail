# Status Implementasi MailZen

## Sudah diimplementasikan di source

- SPA user terpisah dari admin.
- Login/register/OTP menggunakan Supabase Auth.
- Role admin divalidasi dari database.
- Data dashboard, profil, setoran, riwayat, saldo, dan pengumuman memakai query Supabase.
- Submit email melalui RPC dengan validasi limit dan duplikasi pending.
- Penarikan melalui RPC dengan pemeriksaan saldo dan reservasi atomik.
- Approve/reject setoran dan penarikan melalui RPC dengan audit log.
- Refund atomik saat penarikan ditolak.
- Admin GET deduplication, centralized errors, request performance, refresh 15 detik, visibility guard, bulk progress, export TXT, dan optimistic-ready settings API.
- Resend configuration lewat Edge Function dan environment secret.

## Membutuhkan konfigurasi eksternal / pengujian live

- URL/anon key Supabase dan redirect URL.
- SQL schema harus dijalankan pada project target.
- Akun admin pertama harus dipromosikan secara manual.
- Storage bucket/avatar policies.
- Domain Resend terverifikasi dan secret Edge Function.
- Pengujian end-to-end terhadap data project target.
