"use client";

import { ApolloClient, InMemoryCache, ApolloProvider as Provider, HttpLink } from '@apollo/client';
import { ReactNode } from 'react';

import { useState } from 'react';

export function ApolloProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new ApolloClient({
    link: new HttpLink({
      uri: typeof window === 'undefined' ? 'http://localhost:3000/api/graphql' : '/api/graphql',
    }),
    cache: new InMemoryCache(),
  }));

  return <Provider client={client}>{children}</Provider>;
}
