import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import axios from "axios";
import React from "react";
import * as ReactDomTestUtils from "react-dom/test-utils";

// Polyfill for React.act compatibility with React 19
// React 19 doesn't export act from 'react', so we use react-dom/test-utils
// We wrap it to avoid infinite recursion
if (!React.act) {
  try {
    const originalAct = ReactDomTestUtils.act;

    // Create a wrapper that prevents infinite recursion
    let isActing = false;
    const actWrapper = (callback: () => void | Promise<void>) => {
      if (isActing) {
        // If we're already in an act, just execute the callback
        return callback();
      }
      isActing = true;
      try {
        return originalAct(callback);
      } finally {
        isActing = false;
      }
    };

    Object.defineProperty(React, "act", {
      value: actWrapper,
      writable: false,
      configurable: false,
    });
  } catch (e) {
    // If react-dom/test-utils is not available, create a no-op
    Object.defineProperty(React, "act", {
      value: (callback: () => void | Promise<void>) => {
        const result = callback();
        if (result && typeof result === "object" && "then" in result) {
          return Promise.resolve(result);
        }
        return result;
      },
      writable: false,
      configurable: false,
    });
  }
}

// Set React ACT environment flag - this tells React to suppress act warnings
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// Suppress React act warnings in test output (they're handled by React Testing Library)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("not wrapped in act(...)")) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Set up environment variables for tests
process.env.NEXT_PUBLIC_SMS_API_BASE_URL =
  process.env.NEXT_PUBLIC_SMS_API_BASE_URL || "http://localhost:3000";
process.env.NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
// Set NODE_ENV if not already set (using type assertion to bypass readonly check)
if (!process.env.NODE_ENV) {
  (process.env as { NODE_ENV?: string }).NODE_ENV = "test";
}

// Cleanup and reset mocks after each test to avoid cross-test pollution
afterEach(() => {
  // Cleanup React Testing Library DOM
  cleanup();

  // Nettoyer tout ce qui a pu être rendu via des portals dans document.body
  if (typeof document !== "undefined" && document.body) {
    document.body.innerHTML = "";
  }

  // Clear localStorage and sessionStorage after each test
  try {
    if (global.localStorage) global.localStorage.clear();
    if (global.sessionStorage) global.sessionStorage.clear();
  } catch {
    // Ignore storage errors
  }

  // Tenter de nettoyer les éventuels interceptors axios (réels ou mockés)
  try {
    if (axios?.interceptors) {
      const { request, response } = axios.interceptors;
      if ((request as any)?.handlers?.length) {
        (request as any).handlers.splice(0);
      }
      if ((response as any)?.handlers?.length) {
        (response as any).handlers.splice(0);
      }
    }
  } catch {
    // ignore if axios shape is different
  }

  // Reset spies/mocks implementations between tests
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
      forward: jest.fn(),
    };
  },
  usePathname: () => "/",
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock Next.js Image component
jest.mock("next/image", () => {
  const React = require("react");
  return {
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
      React.createElement("img", props),
  };
});

// Mock Next.js Link component to render a simple <a> in tests
jest.mock("next/link", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({
      href,
      children,
      ...rest
    }: {
      href: string;
      children: React.ReactNode;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
      React.createElement("a", { href, ...rest }, children),
  };
});

// Mock Next.js server components (NextRequest, NextResponse)
// Using manual mock in __mocks__/next/server.ts

// Mock next/font
jest.mock("next/font/google", () => ({
  Poppins: jest.fn(() => ({
    variable: "--font-poppins",
    className: "font-poppins",
  })),
}));

// Mock dynamic imports - return a simple loading component for tests
jest.mock("next/dynamic", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: (importFunc: () => Promise<any> | any, options?: any) => {
      // Handle both promise and direct imports
      const Component = importFunc();
      if (Component && typeof Component.then === "function") {
        return Component.then((mod: any) => {
          const LoadedComponent = mod.default || mod;
          return function DynamicWrapper(props: any) {
            return React.createElement(LoadedComponent, props);
          };
        });
      }
      // Handle direct imports
      const LoadedComponent = Component.default || Component;
      return function DynamicWrapper(props: any) {
        return React.createElement(LoadedComponent, props);
      };
    },
  };
});

// Mock window.matchMedia (protégé pour les environnements où window n'est pas encore défini)
if (typeof window !== "undefined" && window) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = "";
  thresholds: ReadonlyArray<number> = [];
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as typeof IntersectionObserver;

// Mock PointerEvent

global.PointerEvent = class PointerEvent extends MouseEvent {
  height: number;
  isPrimary: boolean;
  pointerId: number;
  pointerType: string;
  pressure: number;
  tangentialPressure: number;
  tiltX: number;
  tiltY: number;
  twist: number;
  width: number;

  constructor(type: string, params: PointerEventInit = {}) {
    super(type, params);
    this.pointerId = params.pointerId || 0;
    this.width = params.width || 0;
    this.height = params.height || 0;
    this.pressure = params.pressure || 0;
    this.tangentialPressure = params.tangentialPressure || 0;
    this.tiltX = params.tiltX || 0;
    this.tiltY = params.tiltY || 0;
    this.twist = params.twist || 0;
    this.pointerType = params.pointerType || "";
    this.isPrimary = params.isPrimary || false;
  }
} as any;

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.HTMLElement.prototype.setPointerCapture = jest.fn();
window.HTMLElement.prototype.releasePointerCapture = jest.fn();

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
  } as Response)
);

// Mock React Query de manière "safe" pour éviter les tests qui attendent indéfiniment
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");

  return {
    ...actual,
    // Always try to use real hooks first - they will work if QueryClientProvider is present
    useQuery: jest.fn((options?: any) => {
      try {
        // Always try to use the real useQuery first
        const realUseQuery = actual.useQuery;
        return realUseQuery(options);
      } catch (e) {
        // Fallback to mock only if real hook fails (no QueryClientProvider)
      return {
        data: options?.initialData ?? undefined,
        isLoading: false,
        isFetching: false,
        isError: false,
        isSuccess: true,
        status: "success",
        error: null,
        refetch: jest.fn(),
        remove: jest.fn(),
        fetchStatus: "idle",
        isEnabled: options?.enabled ?? true,
      };
      }
    }),
    useMutation: jest.fn((options?: any) => {
      try {
        // Always try to use the real useMutation first
        const realUseMutation = actual.useMutation;
        return realUseMutation(options);
      } catch (e) {
        // Fallback to mock only if real hook fails (no QueryClientProvider)
      // Return mock that executes callbacks for better test coverage
      let mutationState = {
        isLoading: false,
        isError: false,
        isSuccess: false,
        status: "idle" as const,
        error: null,
        data: undefined,
      };

      const mutateFn = jest.fn(async (variables?: any) => {
        try {
          mutationState.isLoading = true;
          mutationState.status = "loading";
          if (options?.mutationFn) {
            const data = await options.mutationFn(variables);
            mutationState.isLoading = false;
            mutationState.isSuccess = true;
            mutationState.status = "success";
            mutationState.data = data;
            if (options?.onSuccess) {
              await options.onSuccess(data, variables, undefined);
            }
            return data;
          }
        } catch (error) {
          mutationState.isLoading = false;
          mutationState.isError = true;
          mutationState.status = "error";
          mutationState.error = error;
          if (options?.onError) {
            options.onError(error, variables, undefined);
          }
          throw error;
        }
      });
      const mutateAsyncFn = jest.fn(async (variables?: any) => {
        try {
          mutationState.isLoading = true;
          mutationState.status = "loading";
          if (options?.mutationFn) {
            const data = await options.mutationFn(variables);
            mutationState.isLoading = false;
            mutationState.isSuccess = true;
            mutationState.status = "success";
            mutationState.data = data;
            if (options?.onSuccess) {
              await options.onSuccess(data, variables, undefined);
            }
            return data;
          }
        } catch (error) {
          mutationState.isLoading = false;
          mutationState.isError = true;
          mutationState.status = "error";
          mutationState.error = error;
          if (options?.onError) {
            options.onError(error, variables, undefined);
          }
          throw error;
        }
      });
      return {
        mutate: mutateFn,
        mutateAsync: mutateAsyncFn,
        get isLoading() { return mutationState.isLoading; },
        get isError() { return mutationState.isError; },
        get isSuccess() { return mutationState.isSuccess; },
        get status() { return mutationState.status; },
        get error() { return mutationState.error; },
        get data() { return mutationState.data; },
        reset: jest.fn(() => {
          mutationState = {
            isLoading: false,
            isError: false,
            isSuccess: false,
            status: "idle",
            error: null,
            data: undefined,
          };
        }),
      };
      }
    }),
    useQueryClient: jest.fn(() => {
      try {
        // Always try to use the real useQueryClient first
        const actual = jest.requireActual("@tanstack/react-query");
        const realUseQueryClient = actual.useQueryClient;
          return realUseQueryClient();
      } catch {
        // Fallback to mock only if real hook fails (no QueryClientProvider)
      return {
        invalidateQueries: jest.fn(),
        refetchQueries: jest.fn(),
        clear: jest.fn(),
        getQueryData: jest.fn(),
        setQueryData: jest.fn(),
        getDefaultOptions: jest.fn(() => ({
          queries: {
            staleTime: 60000,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        })),
      };
      }
    }),
  };
});

// Mock axios - use jest.requireActual to allow partial mocking
jest.mock("axios", () => {
  const actual = jest.requireActual("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      isAxiosError: (error: unknown): error is { isAxiosError: boolean } =>
        typeof error === "object" &&
        error !== null &&
        "isAxiosError" in error &&
        (error as { isAxiosError: boolean }).isAxiosError === true,
      create: jest.fn(() => ({
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
        interceptors: {
          request: { use: jest.fn(), eject: jest.fn(), handlers: [] },
          response: { use: jest.fn(), eject: jest.fn(), handlers: [] },
        },
      })),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn(), handlers: [] },
        response: { use: jest.fn(), eject: jest.fn(), handlers: [] },
      },
    },
    isAxiosError: (error: unknown): error is { isAxiosError: boolean } =>
      typeof error === "object" &&
      error !== null &&
      "isAxiosError" in error &&
      (error as { isAxiosError: boolean }).isAxiosError === true,
  };
});

// Mock localStorage with actual implementation
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();
global.localStorage = localStorageMock as Storage;

// Mock sessionStorage with actual implementation
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();
global.sessionStorage = sessionStorageMock as Storage;
// Mock cookies-next
jest.mock("cookies-next", () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
  hasCookie: jest.fn(),
}));

// Mock Radix Toast primitives globally to avoid timer / event issues in tests
jest.mock("@radix-ui/react-toast", () => {
  const React = require("react");

  const Primitive = ({ children, ...props }: any) => React.createElement("div", props, children);

  const ButtonPrimitive = ({ children, ...props }: any) =>
    React.createElement("button", props, children);

  return {
    Provider: Primitive,
    Viewport: Primitive,
    Root: Primitive,
    Title: Primitive,
    Description: Primitive,
    Close: ButtonPrimitive,
    Action: ButtonPrimitive,
  };
});

