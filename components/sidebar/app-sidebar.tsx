'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import { Frame, Map, PieChart } from 'lucide-react';

import { NavMain } from '@/components/sidebar/nav-main';
import { NavProjects } from '@/components/sidebar/nav-projects';
import { NavUser } from '@/components/sidebar/nav-user';
import { DepartmentSwitcher } from '@/components/sidebar/department-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

// Minimal sample data for projects only — user data comes from `authData`
const data = {
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
};

interface Department {
  id: number;
  name: string;
  icon: string | null;
}

export function AppSidebar({
  authData,
  ...props
}: React.ComponentProps<typeof Sidebar> & { authData?: any }) {
  const { isMobile } = { isMobile: false };
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = React.useState<Department | null>(
    null,
  );

  React.useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/departments', {
          signal: controller.signal,
        });
        if (!mounted) return;
        if (!res.ok) {
          setDepartments([]);
          return;
        }
        const data: Department[] = await res.json();
        if (mounted) setDepartments(data ?? []);
      } catch (err) {
        if (mounted) setDepartments([]);
      }
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // determine which departments the user has access to
  const userDeptIds = new Set<number>(
    (authData?.positions_meta || []).map((p: any) => p.department_id),
  );
  const allowedDepartments = departments.filter((d) => userDeptIds.has(d.id));

  // compute nav items from authData and selected department
  const navItems = React.useMemo(() => {
    if (!authData) return [];

    const dept =
      selectedDept ||
      (allowedDepartments.length > 0 ? allowedDepartments[0] : null);
    if (!dept) return [];

    const positions = (authData.positions_meta || []).filter(
      (p: any) => p.department_id === dept.id,
    );
    const positionIds = positions.map((p: any) => p.id);

    const accesses: any[] = [];
    positionIds.forEach((pid: number) => {
      const key = `access_${pid}`;
      const arr = authData[key] || [];
      arr.forEach((a: any) => accesses.push(a));
    });

    const screenIds = Array.from(
      new Set(accesses.map((a: any) => a.screen_id)),
    );

    const screens = (authData.screens || []).filter(
      (s: any) =>
        screenIds.includes(s.id) && (s.sidebar === undefined || s.sidebar),
    );

    const groupsMap = (authData.groups || []).reduce((acc: any, g: any) => {
      acc[g.id] = g;
      return acc;
    }, {});

    const grouped: Record<string, any[]> = {};
    const noGroup: any[] = [];
    screens.forEach((s: any) => {
      if (s.group_id) {
        grouped[s.group_id] = grouped[s.group_id] || [];
        grouped[s.group_id].push(s);
      } else {
        noGroup.push(s);
      }
    });

    const items: any[] = [];

    noGroup.forEach((s: any) => {
      items.push({
        title: s.name,
        url: s.url || '#',
        icon: (LucideIcons as any)[s.icon],
        sidebar: s.sidebar,
      });
    });

    Object.keys(grouped).forEach((gid) => {
      const g = groupsMap[gid];
      const screensForGroup = grouped[gid];
      items.push({
        title: g?.name || `Group ${gid}`,
        icon: (LucideIcons as any)[g?.icon],
        isActive: false,
        items: screensForGroup.map((s: any) => ({
          title: s.name,
          url: s.url || '#',
          sidebar: s.sidebar,
        })),
      });
    });

    return items;
  }, [selectedDept, authData, departments]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <DepartmentSwitcher
          departments={allowedDepartments}
          positions={authData?.positions_meta || []}
          onChange={(d) => setSelectedDept(d)}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={authData?.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
