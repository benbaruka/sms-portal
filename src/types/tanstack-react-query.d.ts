declare module "@tanstack/react-query" {
  import type * as React from "react";

  // Minimal stub definitions so the TS linter can resolve the module in tests.
  // The real, complete typings come from the package itself in node_modules.

  export class QueryClient {
    constructor(config?: unknown);
  }

  export interface QueryClientProviderProps {
    client: QueryClient;
    children?: React.ReactNode;
  }

  export function QueryClientProvider(props: QueryClientProviderProps): JSX.Element;
}


