import React from "react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../../../src/components/ui/input-otp";
import { renderWithProviders } from "../../test-utils";

jest.mock("input-otp", () => {
  const MockContext = React.createContext({
    slots: [{ char: "1", hasFakeCaret: false, isActive: false }],
  });

  return {
    OTPInput: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <MockContext.Provider
        value={{ slots: [{ char: "1", hasFakeCaret: false, isActive: false }] }}
      >
        <div data-testid="otp-input" ref={ref} {...props}>
          {children}
        </div>
      </MockContext.Provider>
    )),
    OTPInputContext: MockContext,
  };
});

describe("components/ui/input-otp", () => {
  it("exports InputOTP component", () => {
    expect(InputOTP).toBeDefined();
  });

  it("exports InputOTPGroup component", () => {
    expect(InputOTPGroup).toBeDefined();
  });

  it("exports InputOTPSlot component", () => {
    expect(InputOTPSlot).toBeDefined();
  });

  it("exports InputOTPSeparator component", () => {
    expect(InputOTPSeparator).toBeDefined();
  });

  it("renders InputOTP component", () => {
    const { container } = renderWithProviders(<InputOTP maxLength={6} />);
    expect(container.querySelector('[data-testid="otp-input"]')).toBeInTheDocument();
  });

  it("renders InputOTPGroup component", () => {
    const { container } = renderWithProviders(
      <InputOTPGroup>
        <div>Child</div>
      </InputOTPGroup>
    );
    expect(container.textContent).toContain("Child");
  });

  it("renders InputOTPSlot component", () => {
    const { container } = renderWithProviders(<InputOTPSlot index={0} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders InputOTPSeparator component", () => {
    const { container } = renderWithProviders(<InputOTPSeparator />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies custom className to InputOTP", () => {
    const { container } = renderWithProviders(<InputOTP className="custom-class" maxLength={6} />);
    const input = container.querySelector('[data-testid="otp-input"]');
    expect(input).toHaveClass("custom-class");
  });

  it("applies custom className to InputOTPGroup", () => {
    const { container } = renderWithProviders(
      <InputOTPGroup className="custom-group">
        <div>Test</div>
      </InputOTPGroup>
    );
    const group = container.firstChild;
    expect(group).toHaveClass("custom-group");
  });
});
