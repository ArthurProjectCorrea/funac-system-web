-- migration: create group_screen table and add sidebar & group_id to screen

BEGIN;

-- 1) create group_screen table
CREATE TABLE IF NOT EXISTS public.group_screen (
  id serial primary key,
  name varchar NOT NULL,
  icon varchar,
  open boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) add sidebar and group_id columns to screen
ALTER TABLE public.screen
  ADD COLUMN IF NOT EXISTS sidebar boolean NOT NULL DEFAULT true;

ALTER TABLE public.screen
  ADD COLUMN IF NOT EXISTS group_id integer;

-- 3) add foreign key constraint from screen.group_id -> group_screen.id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = 'screen'
      AND kcu.column_name = 'group_id'
  ) THEN
    ALTER TABLE public.screen
      ADD CONSTRAINT screen_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.group_screen(id) ON DELETE SET NULL;
  END IF;
END;
$$;

COMMIT;
