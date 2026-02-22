'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

// static text for login form
const text = {
  title: 'Entrar na sua conta',
  subtitle: 'Digite seu e-mail abaixo para acessar',
  emailLabel: 'E-mail',
  passwordLabel: 'Senha',
  forgotPassword: 'Esqueceu sua senha?',
  loginButton: 'Entrar',
  orContinue: 'Ou continuar com',
  govButton: 'Entrar com',
  loginSuccess: 'Login realizado!',
  loginError: 'Falha no login, verifique suas credenciais.',
  loading: 'Entrando…',
  imageAlt: 'Imagem',
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const router = useRouter();
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
      toast.error(text.loginError);
      return;
    }

    toast.success(text.loginSuccess);

    // redirect to /home
    router.push('/home');
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{text.title}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {text.subtitle}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">{text.emailLabel}</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">{text.passwordLabel}</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {text.forgotPassword}
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
            {text.loginButton}
          </Button>
        </Field>
        <FieldSeparator>{text.orContinue}</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            disabled
            className="flex items-center gap-2"
          >
            <span>{text.govButton}</span>
            <Image
              src="/gov-logo.png"
              alt={text.imageAlt}
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
