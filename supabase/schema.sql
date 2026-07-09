-- ============================================================
-- İkinciEl — tam verilənlər bazası sxemi (idempotent).
-- Supabase Dashboard -> SQL Editor -> New query -> yapışdır -> Run.
-- Bu faylı istənilən vaxt yenidən işlətmək təhlükəsizdir.
-- ============================================================

-- ---------- PROFİLLƏR ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text,
  avatar_url text,
  balance numeric not null default 0,
  updated_at timestamptz default now()
);

alter table public.profiles add column if not exists balance numeric not null default 0;
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles enable row level security;

drop policy if exists "Profillər hamı üçün görünür" on public.profiles;
create policy "Profillər hamı üçün görünür"
  on public.profiles for select using (true);

drop policy if exists "İstifadəçi öz profilini yeniləyə bilər" on public.profiles;
create policy "İstifadəçi öz profilini yeniləyə bilər"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "İstifadəçi öz profilini əlavə edə bilər" on public.profiles;
create policy "İstifadəçi öz profilini əlavə edə bilər"
  on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- ELANLAR ----------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  price numeric not null,
  category text not null,
  subcategory text,
  city text not null,
  images text[] not null default '{}',
  status text not null default 'active',
  promotion_tier text not null default 'none',
  daily_budget numeric not null default 0,
  promoted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.listings add column if not exists subcategory text;
alter table public.listings add column if not exists promotion_tier text not null default 'none';
alter table public.listings add column if not exists daily_budget numeric not null default 0;
alter table public.listings add column if not exists promoted_at timestamptz;
alter table public.listings enable row level security;

drop policy if exists "Elanlar hamı üçün görünür" on public.listings;
create policy "Elanlar hamı üçün görünür"
  on public.listings for select using (true);

drop policy if exists "İstifadəçi öz elanını əlavə edə bilər" on public.listings;
create policy "İstifadəçi öz elanını əlavə edə bilər"
  on public.listings for insert with check (auth.uid() = user_id);

drop policy if exists "İstifadəçi öz elanını yeniləyə bilər" on public.listings;
create policy "İstifadəçi öz elanını yeniləyə bilər"
  on public.listings for update using (auth.uid() = user_id);

drop policy if exists "İstifadəçi öz elanını silə bilər" on public.listings;
create policy "İstifadəçi öz elanını silə bilər"
  on public.listings for delete using (auth.uid() = user_id);

-- ---------- BALANS ƏMƏLİYYATLARI ----------
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('topup', 'ad_spend')),
  amount numeric not null,
  method text,
  listing_id uuid references public.listings(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.wallet_transactions enable row level security;

drop policy if exists "İstifadəçi öz əməliyyatlarını görür" on public.wallet_transactions;
create policy "İstifadəçi öz əməliyyatlarını görür"
  on public.wallet_transactions for select using (auth.uid() = user_id);

drop policy if exists "İstifadəçi öz əməliyyatını əlavə edə bilər" on public.wallet_transactions;
create policy "İstifadəçi öz əməliyyatını əlavə edə bilər"
  on public.wallet_transactions for insert with check (auth.uid() = user_id);

-- ---------- SÖHBƏTLƏR VƏ MESAJLAR ----------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (listing_id, buyer_id)
);

alter table public.conversations enable row level security;

drop policy if exists "Söhbəti yalnız tərəflər görür" on public.conversations;
create policy "Söhbəti yalnız tərəflər görür"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "Alıcı söhbət başlada bilər" on public.conversations;
create policy "Alıcı söhbət başlada bilər"
  on public.conversations for insert with check (auth.uid() = buyer_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

drop policy if exists "Mesajı yalnız söhbət tərəfləri görür" on public.messages;
create policy "Mesajı yalnız söhbət tərəfləri görür"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (auth.uid() = c.buyer_id or auth.uid() = c.seller_id)
    )
  );

drop policy if exists "Tərəf mesaj göndərə bilər" on public.messages;
create policy "Tərəf mesaj göndərə bilər"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (auth.uid() = c.buyer_id or auth.uid() = c.seller_id)
    )
  );

-- ---------- TƏKLİFLƏR ----------
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now()
);

alter table public.offers enable row level security;

drop policy if exists "Təkliflər hamı üçün görünür" on public.offers;
create policy "Təkliflər hamı üçün görünür"
  on public.offers for select using (true);

drop policy if exists "İstifadəçi təklif verə bilər" on public.offers;
create policy "İstifadəçi təklif verə bilər"
  on public.offers for insert
  with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.user_id <> auth.uid()
    )
  );

drop policy if exists "Elan sahibi təklifə cavab verə bilər" on public.offers;
create policy "Elan sahibi təklifə cavab verə bilər"
  on public.offers for update
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.user_id = auth.uid()
    )
  );

-- ---------- BALANS YÜKLƏMƏ SORĞULARI (kartla köçürmə + çek) ----------
create table if not exists public.topup_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  receipt_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

alter table public.topup_requests enable row level security;

drop policy if exists "İstifadəçi öz sorğularını görür" on public.topup_requests;
create policy "İstifadəçi öz sorğularını görür"
  on public.topup_requests for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
    )
  );

drop policy if exists "İstifadəçi öz sorğusunu əlavə edə bilər" on public.topup_requests;
create policy "İstifadəçi öz sorğusunu əlavə edə bilər"
  on public.topup_requests for insert with check (auth.uid() = user_id);

drop policy if exists "Admin sorğu statusunu yeniləyə bilər" on public.topup_requests;
create policy "Admin sorğu statusunu yeniləyə bilər"
  on public.topup_requests for update
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
    )
  );

-- ---------- STORAGE (avatar + elan şəkilləri) ----------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do update set public = true;

drop policy if exists "Avatar şəkilləri hamı üçün görünür" on storage.objects;
create policy "Avatar şəkilləri hamı üçün görünür"
  on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "İstifadəçi öz avatarını yükləyə bilər" on storage.objects;
create policy "İstifadəçi öz avatarını yükləyə bilər"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "İstifadəçi öz avatarını yeniləyə bilər" on storage.objects;
create policy "İstifadəçi öz avatarını yeniləyə bilər"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Elan şəkilləri hamı üçün görünür" on storage.objects;
create policy "Elan şəkilləri hamı üçün görünür"
  on storage.objects for select using (bucket_id = 'listings');

drop policy if exists "İstifadəçi öz elan şəklini yükləyə bilər" on storage.objects;
create policy "İstifadəçi öz elan şəklini yükləyə bilər"
  on storage.objects for insert
  with check (bucket_id = 'listings' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "İstifadəçi öz elan şəklini silə bilər" on storage.objects;
create policy "İstifadəçi öz elan şəklini silə bilər"
  on storage.objects for delete
  using (bucket_id = 'listings' and auth.uid()::text = (storage.foldername(name))[1]);

-- ---------- STORAGE (balans çekləri — məxfi) ----------
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do update set public = false;

drop policy if exists "Çeki sahibi və ya admin görə bilər" on storage.objects;
create policy "Çeki sahibi və ya admin görə bilər"
  on storage.objects for select
  using (
    bucket_id = 'receipts'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
      )
    )
  );

drop policy if exists "İstifadəçi öz çekini yükləyə bilər" on storage.objects;
create policy "İstifadəçi öz çekini yükləyə bilər"
  on storage.objects for insert
  with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
