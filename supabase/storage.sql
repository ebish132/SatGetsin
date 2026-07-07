-- Profil şəkilləri üçün Storage bucket-i yaradır.
-- Bunu da SQL Editor -> New query bölməsinə yapışdırıb "Run" et.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar şəkilləri hamı üçün görünür"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "İstifadəçi öz avatarını yükləyə bilər"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "İstifadəçi öz avatarını yeniləyə bilər"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
