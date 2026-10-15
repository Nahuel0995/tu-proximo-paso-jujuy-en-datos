-- Ejecutar en Supabase > SQL Editor

-- 1) Administradores autorizados (cargar el email DESPUÉS de crear el usuario en Authentication > Users)
create table if not exists admins (
  email text primary key
);
alter table admins enable row level security;
create policy "admin lee su fila" on admins
  for select to authenticated using (email = auth.jwt() ->> 'email');

create or replace function is_admin() returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from admins where email = auth.jwt() ->> 'email');
$$;

-- 2) Eventos anónimos
create table if not exists eventos (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tipo text not null check (tipo in ('visita','wizard_completo','area_vista')),
  payload jsonb not null default '{}'
);
alter table eventos enable row level security;
create policy "cualquiera registra" on eventos
  for insert to anon, authenticated with check (true);
create policy "solo admin lee" on eventos
  for select to authenticated using (is_admin());

-- 3) Bucket privado para las bases originales
insert into storage.buckets (id, name, public) values ('fuentes', 'fuentes', false)
  on conflict do nothing;
create policy "admin sube fuentes" on storage.objects
  for insert to authenticated with check (bucket_id = 'fuentes' and is_admin());
create policy "admin actualiza fuentes" on storage.objects
  for update to authenticated using (bucket_id = 'fuentes' and is_admin());
create policy "admin lee fuentes" on storage.objects
  for select to authenticated using (bucket_id = 'fuentes' and is_admin());

-- Después: insert into admins (email) values ('tu@email.com');
