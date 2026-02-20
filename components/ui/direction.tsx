'use client';

import * as React from 'react';
import {
  DirectionProvider as RadixDirectionProvider,
  useDirection,
} from '@radix-ui/react-direction';

type Direction = 'ltr' | 'rtl';

function DirectionProvider({
  dir,
  direction,
  children,
}: {
  dir?: Direction;
  direction?: Direction;
  children: React.ReactNode;
}) {
  return (
    <RadixDirectionProvider dir={direction ?? dir ?? 'ltr'}>
      {children}
    </RadixDirectionProvider>
  );
}

export { DirectionProvider, useDirection };
