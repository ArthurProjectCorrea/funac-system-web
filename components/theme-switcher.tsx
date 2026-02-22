'use client';

import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon, MonitorIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// static text for theme switcher labels
const text = {
  ariaLabel: 'Alterar tema',
  light: 'Claro',
  dark: 'Escuro',
  system: 'Sistema',
} as const;

const themeOptions = [
  { value: 'light' as const, icon: SunIcon, key: 'light' as const },
  { value: 'dark' as const, icon: MoonIcon, key: 'dark' as const },
  { value: 'system' as const, icon: MonitorIcon, key: 'system' as const },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={text.ariaLabel}>
          <SunIcon className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{text.ariaLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themeOptions.map(({ value, icon: Icon, key }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={theme === value ? 'bg-accent' : ''}
          >
            <Icon className="mr-2 size-4" />
            {text[key]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
