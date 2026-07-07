-- Elanlar cədvəli və şəkil saxlanması üçün.
-- Bu fayl təhlükəsiz şəkildə bir neçə dəfə işlədilə bilər.
-- SQL Editor -> New query -> yapışdır -> Run.

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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.listings add column if not exists subcategory text;

alter table public.listings enable row level security;

drop policy if exists "Elanlar hamı üçün görünür" on public.listings;
create policy "Elanlar hamı üçün görünür"
  on public.listings for select
  using (true);

drop policy if exists "İstifadəçi öz elanını əlavə edə bilər" on public.listings;
create policy "İstifadəçi öz elanını əlavə edə bilər"
  on public.listings for insert
  with check (auth.uid() = user_id);

drop policy if exists "İstifadəçi öz elanını yeniləyə bilər" on public.listings;
create policy "İstifadəçi öz elanını yeniləyə bilər"
  on public.listings for update
  using (auth.uid() = user_id);

drop policy if exists "İstifadəçi öz elanını silə bilər" on public.listings;
create policy "İstifadəçi öz elanını silə bilər"
  on public.listings for delete
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do update set public = true;

drop policy if exists "Elan şəkilləri hamı üçün görünür" on storage.objects;
create policy "Elan şəkilləri hamı üçün görünür"
  on storage.objects for select
  using (bucket_id = 'listings');

drop policy if exists "İstifadəçi öz elan şəklini yükləyə bilər" on storage.objects;
create policy "İstifadəçi öz elan şəklini yükləyə bilər"
  on storage.objects for insert
  with check (bucket_id = 'listings' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "İstifadəçi öz elan şəklini silə bilər" on storage.objects;
create policy "İstifadəçi öz elan şəklini silə bilər"
  on storage.objects for delete
  using (bucket_id = 'listings' and auth.uid()::text = (storage.foldername(name))[1]);
