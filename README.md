# SatGetsin

Azərbaycan üçün ikinci əl alqı-satqı platforması (Letgo / Tap.az tipli). İstifadəçilər elan yerləşdirir, axtarır, filtrləyir və satıcı ilə daxili mesajlaşma vasitəsilə əlaqə saxlayır.

## Texnologiyalar

- **Next.js (App Router)** + TypeScript
- **Tailwind CSS**
- **Supabase** — verilənlər bazası, autentifikasiya və şəkil saxlama (Storage)

## Xüsusiyyətlər

- Email + şifrə ilə qeydiyyat / giriş (Supabase Auth)
- Profil (ad, telefon, şəhər, profil şəkli)
- Elan yerləşdirmə: başlıq, təsvir, qiymət, kateqoriya + növ, şəhər, çoxlu şəkil
- "Mənim elanlarım": redaktə, sil, "Satıldı" / "Aktiv" statusu
- Axtarış (başlıq üzrə) və filtrlər (kateqoriya, şəhər, qiymət aralığı)
- Elan detal səhifəsi: şəkil qalereyası, satıcı məlumatı
- Alıcı–satıcı daxili mesajlaşma

## Lokal quraşdırma

1. Asılılıqları quraşdırın:
   ```bash
   npm install
   ```

2. `.env.example` faylını `.env.local` adı ilə kopyalayın və Supabase məlumatlarınızı doldurun:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
   ```
   Bu dəyərləri Supabase Dashboard → Settings → API Keys bölməsindən götürün.

3. Verilənlər bazası sxemini qurun: Supabase Dashboard → SQL Editor → New query → `supabase/schema.sql` faylının içindəkini yapışdırıb **Run** basın. (Bu fayl cədvəlləri, təhlükəsizlik qaydalarını və şəkil saxlama yerlərini yaradır; təkrar işlədilə bilər.)

4. Serveri işə salın:
   ```bash
   npm run dev
   ```
   Brauzerdə `http://localhost:3000` açın.

## Deploy (Vercel)

1. Layihəni GitHub-a yükləyin.
2. [vercel.com](https://vercel.com) → New Project → repo-nu seçin.
3. Environment Variables bölməsində `NEXT_PUBLIC_SUPABASE_URL` və `NEXT_PUBLIC_SUPABASE_ANON_KEY` əlavə edin.
4. Deploy basın.
5. Supabase Dashboard → Authentication → URL Configuration bölməsində Vercel domeninizi **Site URL** və **Redirect URLs**-ə əlavə edin.

## Qeydlər

- Prototip mərhələsində email təsdiqi söndürülüb (Authentication → Providers → Email → "Confirm email"). Real istifadəyə keçəndə onu yenidən aktivləşdirmək tövsiyə olunur.
- `.env.local` faylı `.gitignore`-dadır və heç vaxt commit edilməməlidir.
