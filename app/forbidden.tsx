'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Forbidden() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-semibold mb-4">Acesso negado</h1>
        <p className="text-muted-foreground mb-6">
          Você não tem permissão para acessar esta página.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-95"
          >
            Voltar
          </button>

          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md border"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </main>
  );
}
