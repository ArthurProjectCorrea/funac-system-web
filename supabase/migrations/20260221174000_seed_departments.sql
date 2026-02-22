-- migration: seed department records

/*
Insert three sample departments with icons into the department table.
Icons are stored as simple strings (e.g. emoji or icon names). Adjust
values as needed for your UI.
*/

insert into department (name, icon) values
  ('Engineering', '⚙️'),
  ('Human Resources', '👥'),
  ('Marketing', '📣');
