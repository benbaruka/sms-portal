import React from "react";
import { renderToString } from "react-dom/server";

import SidebarWidget from "../../src/layout/SidebarWidget";

// Bypass the real auth flow so the widget renders immediately in tests
jest.mock("@/context/AuthProvider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    checkingAuth: false,
    logout: jest.fn(),
    setIsAuthenticated: jest.fn(),
    setUser: jest.fn(),
    setShouldRedirect: jest.fn(),
  }),
}));

describe("layout/SidebarWidget.tsx", () => {
  const renderSidebarMarkup = () => {
    const serverHtml = renderToString(<SidebarWidget />);
    document.body.innerHTML = serverHtml;
    const widget = document.body.firstElementChild as HTMLElement | null;
    const heading = document.querySelector("h3");
    const description = document.querySelector("p");
    const link = document.querySelector("a");
    return { widget, heading, description, link };
  };

  it("renders sidebar widget", () => {
    const { heading } = renderSidebarMarkup();
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("#1 Tailwind CSS Dashboard");
  });

  it("renders upgrade link", () => {
    const { link } = renderSidebarMarkup();
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent(/upgrade to pro/i);
    expect(link).toHaveAttribute("href", "https://sms-portal.dev.mercury.dadanadagroup.com/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "nofollow noopener noreferrer");
  });

  it("renders description text", () => {
    const { description } = renderSidebarMarkup();
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent(/Leading Tailwind CSS Admin Template/i);
  });

  it("has correct styling classes", () => {
    const { widget } = renderSidebarMarkup();
    expect(widget).toHaveClass("rounded-2xl");
    expect(widget).toHaveClass("bg-gray-50");
  });
});
