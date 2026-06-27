-- DomestiCare: Tabelas do Supabase
-- Execute este SQL no SQL Editor do Supabase Dashboard

-- Tabela de funcionários
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  nome text not null,
  cpf text,
  data_nascimento date,
  endereco text,
  cargo text not null default 'empregada',
  data_admissao date not null,
  salario_bruto numeric(10,2) not null,
  jornada_semanal integer not null default 44,
  vale_transporte boolean not null default false,
  ativo boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de eventos do funcionário
create table if not exists employee_events (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade not null,
  tipo text not null,
  data date not null,
  descricao text,
  valor numeric(10,2),
  created_at timestamptz default now()
);

-- Tabela de obrigações
create table if not exists obligations (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tipo text not null,
  titulo text not null,
  descricao text,
  data_limite date not null,
  employee_id uuid references employees(id) on delete set null,
  status text not null default 'pendente',
  concluido_em timestamptz,
  created_at timestamptz default now()
);

-- RLS (Row Level Security) - cada usuário vê apenas seus dados

alter table employees enable row level security;
alter table employee_events enable row level security;
alter table obligations enable row level security;

-- Policies para employees
create policy "Users can view own employees"
  on employees for select
  using (auth.uid() = user_id);

create policy "Users can insert own employees"
  on employees for insert
  with check (auth.uid() = user_id);

create policy "Users can update own employees"
  on employees for update
  using (auth.uid() = user_id);

create policy "Users can delete own employees"
  on employees for delete
  using (auth.uid() = user_id);

-- Policies para employee_events
create policy "Users can view own employee events"
  on employee_events for select
  using (employee_id in (select id from employees where user_id = auth.uid()));

create policy "Users can insert own employee events"
  on employee_events for insert
  with check (employee_id in (select id from employees where user_id = auth.uid()));

-- Policies para obligations
create policy "Users can view own obligations"
  on obligations for select
  using (auth.uid() = user_id);

create policy "Users can insert own obligations"
  on obligations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own obligations"
  on obligations for update
  using (auth.uid() = user_id);

create policy "Users can delete own obligations"
  on obligations for delete
  using (auth.uid() = user_id);
