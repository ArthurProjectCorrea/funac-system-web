-- migration: normalize department icon names

/*
Update existing department rows to use the Lucide icon component
names expected by the frontend.  Adjust mappings based on the
actual icons you want to display.
*/

update department set icon = 'Settings' where name ilike 'Engineering';
update department set icon = 'Users' where name ilike 'Human Resources';
update department set icon = 'Megaphone' where name ilike 'Marketing';
