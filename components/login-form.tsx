'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Image from 'next/image';

interface LoginLabels {
  title: string;
  subtitle: string;
  emailLabel: string;
  passwordLabel: string;
  forgotPassword: string;
  loginButton: string;
  orContinue: string;
  govButton: string;
  govDescription: string;
  noAccount: string;
  signUp: string;
  loginSuccess: string;
  loginError: string;
  loading: string;
  imageAlt: string;
}

export function LoginForm({
  className,
  labels,
  ...props
}: React.ComponentProps<'form'> & { labels: LoginLabels }) {
  const router = useRouter();
  const pathname = usePathname();
  // const [error, setError] = useState<string | null>(null); // no longer used, toast handles feedback
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (authError) {
      toast.error(labels.loginError);
      return;
    }

    toast.success(labels.loginSuccess);

    // redirect to /home with current locale prefix
    const parts = pathname.split('/').filter(Boolean);
    const locale = parts[0] || '';
    router.push(`/${locale}/home`);
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{labels.title}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {labels.subtitle}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">{labels.emailLabel}</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">{labels.passwordLabel}</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {labels.forgotPassword}
            </a>
          </div>
          <Input id="password" type="password" required />
        </Field>
        <Field>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center"
          >
            {loading ? <Spinner className="mr-2" /> : null}
            {labels.loginButton}
          </Button>
        </Field>
        <FieldSeparator>{labels.orContinue}</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            disabled
            className="flex items-center gap-2"
          >
            <span>{labels.govButton}</span>
            <Image
              src="/gov-logo.png"
              alt={labels.imageAlt}
              width={50}
              height={25}
              className="h-5"
            />
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
