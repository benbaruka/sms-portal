// Manual mock for next/server
const mockNextFn = jest.fn(() => ({ type: "next" }));
const mockRedirectFn = jest.fn((url: URL | string) => {
  const urlObj = typeof url === "string" ? new URL(url) : url;
  return {
    type: "redirect",
    url: urlObj.toString(),
    pathname: urlObj.pathname,
    searchParams: urlObj.searchParams,
  };
});

export const NextResponse = {
  next: mockNextFn,
  redirect: mockRedirectFn,
};

export type NextRequest = {
  cookies: {
    get: (name: string) => { value: string } | undefined;
  };
  nextUrl: {
    pathname: string;
  };
  url: string;
};
