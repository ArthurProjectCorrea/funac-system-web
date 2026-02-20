'use client';

/**
 * Seletor de tema (claro/escuro/sistema).
 * Requer ThemeProvider no layout. Passe as traduções de dict.ThemeSwitcher.
 *
 * @example
 * const dict = await getDictionary(lang);
 * <ThemeSwitcher labels={dict.ThemeSwitcher} />
 */
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon, MonitorIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ThemeSwitcherLabels = {
  ariaLabel: string;
  light: string;
  dark: string;
  system: string;
};

const themeOptions: {
  value: 'light' | 'dark' | 'system';
  icon: typeof SunIcon;
  key: keyof Omit<ThemeSwitcherLabels, 'ariaLabel'>;
}[] = [
  { value: 'light', icon: SunIcon, key: 'light' },
  { value: 'dark', icon: MoonIcon, key: 'dark' },
  { value: 'system', icon: MonitorIcon, key: 'system' },
];

type ThemeSwitcherProps = {
  labels: ThemeSwitcherLabels;
};

export function ThemeSwitcher({ labels }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={labels.ariaLabel}>
          <SunIcon className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{labels.ariaLabel}</span>
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
            {labels[key]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
