-- =============================================================
-- BiblioHome — Supabase Migration
-- Execute este arquivo no SQL Editor do Supabase
-- =============================================================

-- Tabela de perfis de usuário
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  role text default 'member' check (role in ('admin', 'member')),
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Tabela de livros
create table if not exists public.livros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  isbn text,
  titulo text not null,
  autor text,
  editora text,
  ano_publicacao text,
  descricao text,
  paginas integer,
  capa_url text,
  categorias text[] default '{}',
  status text default 'na_colecao' check (status in ('na_colecao', 'lendo', 'desejo', 'concluido')),
  progresso integer default 0 check (progresso >= 0 and progresso <= 100),
  created_at timestamp with time zone default now()
);

-- =============================================================
-- Row Level Security (RLS)
-- =============================================================

-- Habilitar RLS
alter table public.profiles enable row level security;
alter table public.livros enable row level security;

-- Políticas para profiles
create policy "Usuários podem ver seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuários podem inserir seu próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins podem ver todos os perfis"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Políticas para livros
create policy "Usuários podem ver seus próprios livros"
  on public.livros for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir seus próprios livros"
  on public.livros for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar seus próprios livros"
  on public.livros for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar seus próprios livros"
  on public.livros for delete
  using (auth.uid() = user_id);

-- =============================================================
-- Trigger: Criar perfil automaticamente no signup
-- =============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    case
      when (select count(*) from public.profiles) = 0 then 'admin'
      else 'member'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger no signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================
-- Índices para performance
-- =============================================================

create index if not exists idx_livros_user_id on public.livros(user_id);
create index if not exists idx_livros_status on public.livros(status);
create index if not exists idx_livros_isbn on public.livros(isbn);
create index if not exists idx_livros_created_at on public.livros(created_at desc);
