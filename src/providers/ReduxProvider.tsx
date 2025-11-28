'use client';

import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '~/store';

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: Readonly<ReduxProviderProps>) {
  return <Provider store={store}>{children}</Provider>;
}

