// Minimal module declaration to satisfy TypeScript and ESLint for tests that
// import from "@testing-library/react". The actual runtime implementation
// comes from the installed package.
declare module "@testing-library/react" {
  export * from "@testing-library/dom";
}


