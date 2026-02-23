'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-95"
    >
      Voltar
    </button>
  );
}
