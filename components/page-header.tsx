'use client';

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface HeaderBreadcrumb {
  label: string;
  href?: string;
}

export default function PageHeader({ items }: { items?: HeaderBreadcrumb[] }) {
  const defaultItems: HeaderBreadcrumb[] = [
    { label: 'Build Your Application', href: '#' },
    { label: 'Data Fetching' },
  ];

  const list = items && items.length > 0 ? items : defaultItems;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {list.map((it, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                <BreadcrumbItem
                  className={idx === list.length - 1 ? '' : 'hidden md:block'}
                >
                  {it.href && idx !== list.length - 1 ? (
                    <BreadcrumbLink href={it.href}>{it.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{it.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
