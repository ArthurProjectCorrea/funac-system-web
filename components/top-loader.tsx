'use client';

import NextTopLoader from 'nextjs-toploader';

export default function TopLoaderWrapper() {
  return (
    <NextTopLoader
      color="var(--primary)"
      height={3}
      showSpinner={false}
      shadow="0 0 8px var(--primary),0 0 4px var(--primary)"
      zIndex={1600}
    />
  );
}
