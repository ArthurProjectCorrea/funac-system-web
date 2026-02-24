-- seed_initial_setup migration: add default department and position

-- create a department for system configuration if it doesn't exist
do $$
begin
  if not exists (select 1 from public.departments where name = 'Configuração do Sistema') then
    insert into public.departments (name, created_at, updated_at)
    values ('Configuração do Sistema', now(), now());
  end if;
end
$$;

-- ensure "Administrador" position exists under the system configuration department
insert into public.positions (department_id, name, created_at, updated_at)
select d.id, 'Administrador', now(), now()
from public.departments d
where d.name = 'Configuração do Sistema'
  and not exists (
    select 1 from public.positions p
    where p.department_id = d.id and p.name = 'Administrador'
  );
