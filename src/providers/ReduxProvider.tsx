'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import type { Store } from '@reduxjs/toolkit';

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: Readonly<ReduxProviderProps>) {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    import('~/client/store').then((m) => setStore(m.store));
  }, []);

  if (!store) return null;

  return <Provider store={store}>{children}</Provider>;
}

