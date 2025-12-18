import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare global {
  namespace jest {
    // Allow empty-extend interfaces here: we intentionally augment Jest's
    // assertion types with Testing Library's DOM matchers without adding
    // extra members, which is a valid declaration-merging pattern.
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Matchers<R> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
  }
}

