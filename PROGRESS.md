# VerGetsin — Layihə Vəziyyəti (Progress Log)

> Bu fayl yeni Claude sessiyasının işə davam edə bilməsi üçün yazılıb. Son yenilənmə: 2026-07-07.

## Layihə nədir

Azərbaycan üçün ikinci əl əşya alqı-satqı marketplace-i (Letgo/Tap.az tipli).
**Sayt adı: VerGetsin** (əvvəlki adlar: "İkinciEl" → "SatGetsin" → "SataSat" → **"VerGetsin"**, sonuncusu final).

- **Canlı domen:** https://www.vergetsin.online (əsas), `vergetsin.online` apex → www-ə redirect
- **Vercel layihəsi:** `sat-getsin-online/sat-getsin` (Vercel-də layihə adı köhnə qalıb, funksional problem deyil)
- **GitHub repo:** https://github.com/ebish132/SatGetsin (repo adı da köhnə qalıb "SatGetsin" — sadəcə kosmetik uyğunsuzluq)
- **Yerli qovluq:** `C:\Users\User\Documents\Ikinci El`
- **Supabase layihəsi:** ref `yabeszocttbmsdqktawh`, region Frankfurt

## Texnologiyalar

Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS + Supabase (Auth, Postgres, Storage). Deploy: Vercel. Domen registrarı: Spaceship.

## Tamamlanmış mərhələlər (5 əsas mərhələ)

1. **Skeleton + ana səhifə** — Header/Footer/CategoryNav, mobil alt naviqasiya menyusu (`BottomNav.tsx`)
2. **Supabase Auth + profil** — qeydiyyat/giriş, profil (ad, telefon [10 rəqəm məcburi], şəhər, avatar)
3. **Elan yerləşdirmə/idarəetmə** — çoxlu şəkil yükləmə, kateqoriya+növ seçimi, "Mənim elanlarım" (redaktə/sil/satıldı)
4. **Axtarış/filter/detal** — kateqoriya, şəhər, qiymət aralığı filtrləri, elan detal səhifəsi, şəkil qalereyası
5. **Mesajlaşma** — alıcı-satıcı daxili mesajlaşma (`conversations`, `messages` cədvəlləri)

## Bunlardan sonra əlavə edilən böyük funksiyalar

### Reklam/Promosiya sistemi
- Elan yerləşdirərkən "Elanı önə çıxar" seçimi: 0.50–2.00 AZN slider
- 1.50 AZN-ə qədər = **Sadə** önə çıxarma, 1.50+ = **VIP** (qızılı nişan, parıltı animasiyası)
- `promotion_tier`, `daily_budget`, `promoted_at` sütunları `listings` cədvəlində
- **24 saat kilid qaydası:** reklam aktivləşdikdən sonra ləğv edilə/dəyişilə bilməz, 24 saat sonra yenidən mümkündür (`app/elan-yerlesdir/actions.ts` içində `isLocked` məntiqi)
- Aktivləşdirmə zamanı istifadəçinin balansından məbləğ çıxılır (`wallet_transactions` cədvəlinə `ad_spend` qeydi)

### Balans sistemi — manual kart köçürməsi + çek təsdiqi (YENİLƏNDİ)
- Köhnə "kart seç + birbaşa balansa əlavə et" axını (`TOPUP_ENABLED`) TAMAMİLƏ ƏVƏZ OLUNDU
- Yeni axın: istifadəçi məbləğ seçir → sabit kart nömrəsi göstərilir (`components/TopUpForm.tsx` içində `CARD_NUMBER`) → çekin şəklini yükləyir (`receipts` private bucket) → `topup_requests` cədvəlinə `pending` statusla düşür
- **Admin paneli:** `/admin/balans` (yalnız `profiles.is_admin = true` olanlara açıqdır) — gözləyən sorğuları, çek şəklini (signed URL, 5 dəq.) və Təsdiqlə/Rədd et düymələrini göstərir. Təsdiqləndikdə balans avtomatik artır + `wallet_transactions`-a yazılır
- Header-də admin görünürsə "Admin" linki çıxır
- ⚠️ **MANUAL ADDIM LAZIMDIR:** yeni sxem (`topup_requests`, `receipts` bucket, `profiles.is_admin`) Supabase SQL Editor-da run edilməyib; sonra istifadəçi öz hesabını admin etmək üçün bir dəfəlik `update public.profiles set is_admin = true where id = '<user id>';` işlətməlidir (email-dən user id-ni Supabase Dashboard → Authentication → Users-dan tapır)
- Kart nömrəsi/CVV-ni öz formamızda toplama qərarı **hələ də qüvvədədir** — yalnız çek şəkli yüklənir, kart məlumatı heç vaxt formada daxil edilmir

### Email kodu ilə təsdiqləmə (bu sessiyanın son işi)
- Supabase-də "Confirm email" YENİDƏN AKTİV edildi (əvvəllər prototip üçün söndürülmüşdü)
- **Custom SMTP quruldu:** Gmail (`alfaebis@gmail.com` + App Password) üzərindən `smtp.gmail.com:587`
- "Confirm signup" email şablonu dəyişdirildi: link əvəzinə `{{ .Token }}` (6 rəqəmli kod) göstərir
- Email OTP uzunluğu 8-dən 6-ya endirildi (Supabase Auth → Providers → Email tənzimləməsi)
- Yeni səhifə: `/dogrula` (`app/dogrula/page.tsx` + `components/VerifyCodeForm.tsx`) — kod daxiletmə forması
- `app/login/actions.ts`: `signUp()` artıq avtomatik giriş etmir, `/dogrula?email=...`-a yönləndirir; yeni `verifySignupCode()` və `resendSignupCode()` funksiyaları əlavə edildi
- **Test edildi və işləyir** — canlı saytda tam qeydiyyat→kod→giriş axını uğurla yoxlanıldı (kod Gmail-ə gəldi, təsdiqləndi, `/profil`-ə düşdü)

### SEO (bu sessiyanın işi)
- `sitemap.xml`, `robots.ts`, hər elan üçün `generateMetadata`, JSON-LD, Google Search Console-a doğrulama+sitemap göndərildi
- Ana səhifə/footer-ə "ikinci əl alqı-satqı" görünən mətn əlavə edildi (SEO üçün, meta teqlər tək kifayət etmirdi)
- Brend loqosuna uyğun favicon/app icon (`app/icon.tsx`, `app/apple-icon.tsx`, `next/og` ilə generasiya olunur)

### Təkliflər (offers) — elan səhifəsində qiymət təklifi
- Yeni `offers` cədvəli (`listing_id`, `buyer_id`, `amount`, `status`), RLS: hamı görə bilər, alıcı təklif verə bilər (öz elanına yox), yalnız elan sahibi qəbul/rədd edə bilər
- `app/elan/[id]/actions.ts`: `makeOffer`, `respondToOffer`
- `components/OfferForm.tsx` + `app/elan/[id]/page.tsx`-də "Təkliflər" kartı
- ⚠️ **SQL manual işə salınmalıdır** — `supabase/schema.sql`-in yeni hissəsi (`offers` cədvəli) hələ Supabase SQL Editor-da run edilməyib

## Domen tarixçəsi (qarışıqlığın qarşısını almaq üçün)

- `satgetsin.az` — alınıb amma İSTİFADƏ OLUNMUR (bağlı deyil, sərbəst qalıb)
- `satgetsin.online` — alınıb, Vercel-ə bağlanıb, sonra Vercel-dən SİLİNİB (istəyərək) → indi 404 verir, bu normaldır
- `vergetsin.online` — **HAZIRKI AKTİV DOMEN**, Spaceship-də qeydiyyatlı, DNS Vercel-ə yönləndirilib

## Vacib texniki qərarlar / "gotcha"lar

- **Next.js 16:** `middleware.ts` → `proxy.ts` adlandırılıb (köhnə adla xəbərdarlıq verir/işləməyə bilər)
- **Node.js** bu Windows maşınında əvvəlcə yox idi, winget ilə quraşdırıldı (`C:\Program Files\nodejs`). PATH avtomatik yenilənmir — hər PowerShell çağırışında `$env:Path = "C:\Program Files\nodejs;" + $env:Path` lazımdır
- Preview dev server `.claude/dev.cmd` wrapper vasitəsilə işə salınır (PATH problemi üzündən)
- `redirect()`-ə Azərbaycan hərfləri olan query string veriləndə mütləq `encodeURIComponent` ilə örtülməlidir (əvvəllər 500 xətasına səbəb olmuşdu, düzəldilib)
- Supabase-in default email şablonlarını redaktə etmək üçün **custom SMTP mütləqdir** (SMTP olmadan yalnız default link-based şablon işləyir, kod göstərmək mümkün deyil)
- DNS qeydləri (həm satgetsin.online, həm vergetsin.online üçün eyni): `A @ → 216.198.79.1`, `CNAME www → cname.vercel-dns.com`

## Növbəti addımlar

1. **Payriff (və ya alternativ) tacir hesabı** — istifadəçi hesab açıb API açarlarını (Merchant ID + Secret key) verməli, sonra balans yükləmə real ödənişlə işə salınmalı (`TOPUP_ENABLED = true` + real API inteqrasiyası)
2. M10 ödəniş üsulu üçün Payriff-in dəstəyi yoxlanılmalı (UI-da seçim var, backend yoxdur)
3. `satgetsin.az` domeninin taleyi barədə qərar (saxla/sil/redirect et)
4. Vercel layihə adı və GitHub repo adının "VerGetsin"-ə uyğunlaşdırılması (istəyə bağlı, kosmetik)
5. Real istifadəçilərlə end-to-end test: elan yaratma (şəkillə), mesajlaşma, VIP reklam axını (balans aktivləşəndən sonra)

## İstifadəçi ilə iş tərzi

- Qısa, birbaşa cavablar istəyir (3-6 sözlük cümlələr, əvvəl nəticə, sonra dayan, artıq izahat yox)
- Chrome brauzerində sərbəst hərəkət etmək üçün icazə verilib (Vercel/Supabase/Spaceship dashboard-larında naviqasiya və konfiqurasiya)
- Sistem/təhlükəsizlik tənzimləmələri (VPN, OS parametrləri) və maliyyə etimadnamələri (kart, CVV) heç vaxt mənim tərəfimdən daxil edilmir/dəyişdirilmir — bu sərt qaydadır, icazə versə belə keçərli deyil
