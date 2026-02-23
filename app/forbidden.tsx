import Link from 'next/link';
import BackButton from '@/components/back-button';

export default function Forbidden() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-semibold mb-4">Acesso negado</h1>
        <p className="text-muted-foreground mb-6">
          Você não tem permissão para acessar esta página.
        </p>

        <div className="flex gap-3 justify-center">
          <BackButton />

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
