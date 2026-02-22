'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import { ChevronsUpDown, Plus } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface Department {
  id: number;
  name: string;
  icon: string | null;
}

interface DepartmentContextType {
  departments: Department[];
  active?: Department | null;
  setActive: (d: Department) => void;
  loading: boolean;
}

// static Portuguese labels
const text = {
  label: 'Departamentos',
  add: 'Adicionar departamento',
} as const;

// DepartmentSwitcher manages its own state; no external provider needed

export function DepartmentSwitcher({
  departments: initialDepartments,
  positions,
  onChange,
}: {
  departments?: Department[];
  positions?: any[];
  onChange?: (d: Department | null) => void;
}) {
  const { isMobile } = useSidebar();

  const [departments, setDepartments] = React.useState<Department[]>(
    initialDepartments ?? [],
  );
  const [active, setActive] = React.useState<Department | null>(
    initialDepartments && initialDepartments.length > 0
      ? initialDepartments[0]
      : null,
  );
  const [loading, setLoading] = React.useState(
    !initialDepartments || initialDepartments.length === 0,
  );

  React.useEffect(() => {
    if (initialDepartments && initialDepartments.length > 0) {
      setDepartments(initialDepartments);
      setActive(initialDepartments[0]);
      if (onChange) onChange(initialDepartments[0]);
      setLoading(false);
      return;
    }

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
          setActive(null);
          return;
        }
        const data: Department[] = await res.json();
        if (mounted) {
          setDepartments(data ?? []);
          setActive(data && data.length > 0 ? data[0] : null);
        }
      } catch (err) {
        if (mounted) {
          setDepartments([]);
          setActive(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [initialDepartments]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {loading
                  ? null
                  : (() => {
                      const IconComp = active?.icon
                        ? (LucideIcons as any)[active.icon]
                        : (LucideIcons as any).Map;
                      return IconComp ? <IconComp className="size-4" /> : null;
                    })()}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {loading ? null : active ? active.name : null}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {loading
                    ? null
                    : active
                      ? (positions || [])
                          .filter((p: any) => p.department_id === active.id)
                          .map((p: any) => p.name)
                          .join(', ')
                      : null}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {text.label}
            </DropdownMenuLabel>
            {loading ? (
              <DropdownMenuItem key="loading" className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border" />
                <div className="text-muted-foreground">Carregando...</div>
              </DropdownMenuItem>
            ) : (
              departments.map((dept, index) => (
                <DropdownMenuItem
                  key={dept.id}
                  onClick={() => {
                    setActive(dept);
                    if (onChange) onChange(dept);
                  }}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    {(() => {
                      const IconComp = dept.icon
                        ? (LucideIcons as any)[dept.icon]
                        : (LucideIcons as any).Map;
                      return IconComp ? (
                        <IconComp className="size-3.5 shrink-0" />
                      ) : null;
                    })()}
                  </div>
                  <div className="flex-1">
                    <div>{dept.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {
                        // subtitle: find user's position name(s) for this department
                        (positions || [])
                          .filter((p: any) => p.department_id === dept.id)
                          .map((p: any) => p.name)
                          .join(', ') || ''
                      }
                    </div>
                  </div>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                {text.add}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
