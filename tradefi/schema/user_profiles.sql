create table public.user_profiles (
  id uuid not null,
  email text null,
  full_name text null,
  avatar_url text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;