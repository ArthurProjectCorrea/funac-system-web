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

    const permissionsByRoute = authData.permissionsByRoute || {};

    const screens = (authData.screens || []).filter((s: any) => {
      const visibleInSidebar = s.sidebar === undefined || s.sidebar;
      const inAccessList = screenIds.includes(s.id);
      const hasView = (permissionsByRoute[s.url] || []).includes('view');
      // only include screens that are in the user's access list, meant for sidebar,
      // and for which the user has the 'view' permission
      return inAccessList && visibleInSidebar && hasView;
    });

    // modules map replaces previous group_screen functionality
    const modulesMap = (authData.modules || []).reduce((acc: any, m: any) => {
      acc[m.id] = m;
      return acc;
    }, {});

    const grouped: Record<string, any[]> = {};
    const noModule: any[] = [];
    screens.forEach((s: any) => {
      if (s.module_id) {
        grouped[s.module_id] = grouped[s.module_id] || [];
        grouped[s.module_id].push(s);
      } else {
        noModule.push(s);
      }
    });

    const items: any[] = [];

    noModule.forEach((s: any) => {
      items.push({
        title: s.name,
        url: s.url || '#',
        icon: (LucideIcons as any)[s.icon],
        sidebar: s.sidebar,
      });
    });

    Object.keys(grouped).forEach((mid) => {
      const m = modulesMap[mid];
      const screensForModule = grouped[mid];
      items.push({
        title: m?.name || `Module ${mid}`,
        icon: (LucideIcons as any)[m?.icon],
        isActive: false,
        items: screensForModule.map((s: any) => ({
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
