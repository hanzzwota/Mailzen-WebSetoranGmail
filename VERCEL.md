# Deployment Vercel

Repository ini adalah static site HTML/JavaScript, bukan Vite atau React app. Karena itu Vercel tidak membutuhkan `src/` maupun `public/`; semua file runtime berada di root repository dan subfolder `supabase/` hanya berisi Edge Function.

`index.html` menjadi entry page domain utama dan mengarahkan user ke `login.html`. `vercel.json` mengatur URL berikut:

- `/` → `login.html`
- `/login` → `login.html`
- `/app` → `app.html`
- `/admin` → `admin.html`

Pada Vercel, pilih **Other** atau static deployment tanpa build command. Jika memakai project lama, pastikan Root Directory menunjuk ke root repository dan hapus Build Command yang mengharuskan `npm run build`.

Setelah deploy, konfigurasi URL dan anon key Supabase melalui `window.MAILZEN_CONFIG` pada halaman atau ganti placeholder pada `supabase-config.js`. Jangan memasukkan `SUPABASE_SERVICE_ROLE_KEY` atau `RESEND_API_KEY` ke repository/browser.
