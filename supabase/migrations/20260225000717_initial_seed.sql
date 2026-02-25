-- migration: initial seed for departments/positions/screens/permissions and link to user

BEGIN;

-- ensure a department exists
INSERT INTO departments (name, icon, created_at, updated_at)
SELECT 'Default Dept', NULL, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Default Dept');

-- grab department id in a variable-like way

-- create a global position and a departmental position
INSERT INTO positions (department_id, name, is_global, created_at, updated_at)
SELECT d.id, 'Regular', false, now(), now()
FROM departments d
WHERE d.name = 'Default Dept'
  AND NOT EXISTS (
    SELECT 1 FROM positions p WHERE p.department_id = d.id AND p.name = 'Regular'
  );

INSERT INTO positions (department_id, name, is_global, created_at, updated_at)
SELECT d.id, 'Global Admin', true, now(), now()
FROM departments d
WHERE d.name = 'Default Dept'
  AND NOT EXISTS (
    SELECT 1 FROM positions p WHERE p.name = 'Global Admin'
  );

-- create some modules and screens
INSERT INTO modules (name, icon, sort_order, created_at, updated_at)
SELECT 'Main', NULL, 0, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM modules WHERE name = 'Main');

INSERT INTO screens (name, url, icon, show_in_sidebar, module_id, created_at, updated_at)
SELECT 'Home', '/home', NULL, true, m.id, now(), now()
FROM modules m WHERE m.name = 'Main'
  AND NOT EXISTS (SELECT 1 FROM screens s WHERE s.url = '/home');

INSERT INTO screens (name, url, icon, show_in_sidebar, module_id, created_at, updated_at)
SELECT 'Teste', '/teste', NULL, true, m.id, now(), now()
FROM modules m WHERE m.name = 'Main'
  AND NOT EXISTS (SELECT 1 FROM screens s WHERE s.url = '/teste');

-- ensure permissions
INSERT INTO permissions (name, created_at, updated_at)
SELECT 'view', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view');

INSERT INTO permissions (name, created_at, updated_at)
SELECT 'create', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'create');

-- link user to a position via profiles/profile_positions
INSERT INTO profiles (user_id, name, created_at, updated_at)
SELECT u.id, u.email, now(), now()
FROM auth.users u
WHERE u.id = '99fe30c5-a3f1-4c12-a7d6-10ec340aa0ee'
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id);

-- pick one of the positions (regular)
WITH chosen AS (
  SELECT id FROM positions WHERE name = 'Regular' LIMIT 1
)
INSERT INTO profile_positions (user_id, position_id, created_at, updated_at)
SELECT '99fe30c5-a3f1-4c12-a7d6-10ec340aa0ee', c.id, now(), now()
FROM chosen c
WHERE NOT EXISTS (
  SELECT 1 FROM profile_positions pp
  WHERE pp.user_id = '99fe30c5-a3f1-4c12-a7d6-10ec340aa0ee' AND pp.position_id = c.id
);

-- grant view permission on both screens to that position
WITH pos AS (
  SELECT id FROM positions WHERE name = 'Regular' LIMIT 1
),
view_perm AS (
  SELECT id FROM permissions WHERE name = 'view' LIMIT 1
),
screen_ids AS (
  SELECT id FROM screens WHERE url IN ('/home','/teste')
)
INSERT INTO accesses (position_id, screen_id, permission_id, created_at, updated_at)
SELECT p.id, s.id, v.id, now(), now()
FROM pos p, view_perm v, screen_ids s
WHERE NOT EXISTS (
  SELECT 1 FROM accesses a
  WHERE a.position_id = p.id
    AND a.screen_id = s.id
    AND a.permission_id = v.id
);

COMMIT;
