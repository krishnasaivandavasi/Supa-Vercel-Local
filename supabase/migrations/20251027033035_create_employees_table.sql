-- Create employees table
create table public.employees (
    id serial primary key,
    name text not null,
    email text unique not null,
    position text,
    salary numeric
);

-- Enable Row Level Security
alter table public.employees enable row level security;

-- Add RLS policy: allow all users to read
create policy "allow read for all" 
    on public.employees
    for select
    using (true);
