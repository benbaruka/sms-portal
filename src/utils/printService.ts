/**
 * Calls window.print() if available
 * @returns void
 */
export const windowPrint = (): void => {
  if (typeof window !== "undefined" && typeof window.print === "function") {
    window.print();
  }
};
