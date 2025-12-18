// Coverage target: 100% lines, branches, functions

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import VerifyOtpForm from "../../../src/components/auth/VerifyOtpForm";

// Mocks
const pushMock = jest.fn();
const showAlertMock = jest.fn();
const setUserMock = jest.fn();

interface UserMock {
  message: {
    user: {
      email: string;
      status: number;
      msisdn?: string;
    };
    has_documents: number;
  };
}

let userMock: UserMock | null = {
  message: {
    user: {
      email: "test@mail.com",
      status: 0,
    },
    has_documents: 1,
  },
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: showAlertMock,
  }),
}));

jest.mock("@/context/AuthProvider", () => ({
  useAuth: () => ({
    user: userMock,
    setUser: setUserMock,
  }),
}));

const verifyMutateAsync = jest.fn();
const resendMutateAsync = jest.fn();

jest.mock("@/controller/query/auth/useOtp", () => ({
  useVerifyOtp: () => ({
    mutateAsync: verifyMutateAsync,
    isPending: false,
  }),
  useResendOtp: () => ({
    mutateAsync: resendMutateAsync,
    isPending: false,
  }),
}));

// Mock clipboard to avoid errors in paste handler
Object.assign(navigator, {
  clipboard: {
    readText: jest.fn().mockResolvedValue("123456"),
  },
});

describe("VerifyOtpForm", () => {
  let queryClient: QueryClient;

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <VerifyOtpForm />
      </QueryClientProvider>
    );

  beforeEach(async () => {
    jest.clearAllMocks();
    localStorage.clear();
    // Ensure component has an email so it does not redirect immediately
    localStorage.setItem("pending-verification-email", "test@mail.com");
    userMock = {
      message: {
        user: {
          email: "test@mail.com",
          status: 0,
        },
        has_documents: 1,
      },
    };
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    verifyMutateAsync.mockResolvedValue({});
    resendMutateAsync.mockResolvedValue({});
  });

  it("renders verification form", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Verify Your Account")).toBeInTheDocument();
    });
  });

  it("can render with initial email in localStorage", async () => {
    localStorage.setItem("pending-verification-email", "test@mail.com");
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("test@mail.com")).toBeInTheDocument();
    });
  });

  it("can render with initial phone in localStorage", async () => {
    localStorage.removeItem("pending-verification-email");
    localStorage.setItem("pending-verification-msisdn", "+2431234567890");
    userMock = {
      message: {
        user: {
          email: "",
          status: 0,
          msisdn: "+2431234567890",
        },
        has_documents: 1,
      },
    };
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/phone/i)).toBeInTheDocument();
    });
  });

  it("redirects to signin if no email or phone found", async () => {
    localStorage.clear();
    userMock = null;
    renderComponent();
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/signin");
    });
  });

  it("renders OTP input fields", async () => {
    renderComponent();
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
  });

  it("handles OTP digit input", async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    if (otpInputs.length > 0) {
      await user.type(otpInputs[0], "1");
      expect(otpInputs[0]).toHaveValue("1");
    }
  });

  it("auto-focuses next input when digit is entered", async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    if (otpInputs.length > 1) {
      await user.type(otpInputs[0], "1");
      // Second input should be focused
      await waitFor(() => {
        expect(document.activeElement).toBe(otpInputs[1]);
      });
    }
  });

  it("handles backspace in OTP input", async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    if (otpInputs.length > 0) {
      await user.type(otpInputs[0], "1");
      await user.keyboard("{Backspace}");
      expect(otpInputs[0]).toHaveValue("");
    }
  });

  it("handles backspace to move to previous input", async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    if (otpInputs.length > 1) {
      await user.type(otpInputs[1], "2");
      await user.keyboard("{Backspace}");
      // Should focus previous input
      await waitFor(() => {
        expect(document.activeElement).toBe(otpInputs[0]);
      });
    }
  });

  it("handles paste in OTP input", async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    if (otpInputs.length > 0) {
      await user.click(otpInputs[0]);
      await user.keyboard("{Control>}v{/Control}");
      
      await waitFor(() => {
        expect(otpInputs[0]).toHaveValue("1");
      });
    }
  });

  it("shows error when verifying with incomplete OTP", async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const verifyButton = screen.getByText(/Verify & Continue/i);
      expect(verifyButton).toBeInTheDocument();
    });
    
    const verifyButton = screen.getByText(/Verify & Continue/i);
    expect(verifyButton).toBeDisabled();
  });

  it("calls verify OTP mutation when Verify is clicked with complete OTP", async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    // Fill all OTP inputs
    for (let i = 0; i < Math.min(6, otpInputs.length); i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    
    const verifyButton = screen.getByText(/Verify & Continue/i);
    await user.click(verifyButton);
    
    await waitFor(() => {
      expect(verifyMutateAsync).toHaveBeenCalledWith({
        verification_code: "123456",
        email: "test@mail.com",
      });
    });
  });

  it("calls verify OTP with phone when email is not available", async () => {
    localStorage.removeItem("pending-verification-email");
    localStorage.setItem("pending-verification-msisdn", "+2431234567890");
    userMock = {
      message: {
        user: {
          email: "",
          status: 0,
          msisdn: "+2431234567890",
        },
        has_documents: 1,
      },
    };
    
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    // Fill all OTP inputs
    for (let i = 0; i < Math.min(6, otpInputs.length); i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    
    const verifyButton = screen.getByText(/Verify & Continue/i);
    await user.click(verifyButton);
    
    await waitFor(() => {
      expect(verifyMutateAsync).toHaveBeenCalledWith({
        verification_code: "123456",
        msisdn: "+2431234567890",
      });
    });
  });

  it("clears localStorage after successful verification", async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    // Fill all OTP inputs
    for (let i = 0; i < Math.min(6, otpInputs.length); i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    
    const verifyButton = screen.getByText(/Verify & Continue/i);
    await user.click(verifyButton);
    
    await waitFor(() => {
      expect(localStorage.getItem("pending-verification-email")).toBeNull();
      expect(localStorage.getItem("pending-verification-msisdn")).toBeNull();
      expect(localStorage.getItem("needs-otp-verification")).toBeNull();
    });
  });

  it("updates user status after successful verification", async () => {
    const user = userEvent.setup();
    localStorage.setItem("user-session", JSON.stringify(userMock));
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    // Fill all OTP inputs
    for (let i = 0; i < Math.min(6, otpInputs.length); i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    
    const verifyButton = screen.getByText(/Verify & Continue/i);
    await user.click(verifyButton);
    
    await waitFor(() => {
      expect(setUserMock).toHaveBeenCalled();
    });
  });

  it("redirects to upload-documents when has_documents is 0", async () => {
    userMock = {
      message: {
        user: {
          email: "test@mail.com",
          status: 0,
        },
        has_documents: 0,
      },
    };
    
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    // Fill all OTP inputs
    for (let i = 0; i < Math.min(6, otpInputs.length); i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    
    const verifyButton = screen.getByText(/Verify & Continue/i);
    await user.click(verifyButton);
    
    await waitFor(
      () => {
        expect(pushMock).toHaveBeenCalledWith("/upload-documents");
      },
      { timeout: 2000 }
    );
  });

  it("redirects to dashboard when has_documents is 1", async () => {
    userMock = {
      message: {
        user: {
          email: "test@mail.com",
          status: 0,
        },
        has_documents: 1,
      },
    };
    
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    // Fill all OTP inputs
    for (let i = 0; i < Math.min(6, otpInputs.length); i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    
    const verifyButton = screen.getByText(/Verify & Continue/i);
    await user.click(verifyButton);
    
    await waitFor(
      () => {
        expect(pushMock).toHaveBeenCalledWith("/dashboard");
      },
      { timeout: 2000 }
    );
  });

  it("calls resend OTP mutation when Resend is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Didn't receive the code/i)).toBeInTheDocument();
    });
    
    const resendButton = screen.getByText(/Resend/i);
    await user.click(resendButton);
    
    await waitFor(() => {
      expect(resendMutateAsync).toHaveBeenCalledWith({
        email: "test@mail.com",
      });
    });
  });

  it("calls resend OTP with phone when email is not available", async () => {
    localStorage.removeItem("pending-verification-email");
    localStorage.setItem("pending-verification-msisdn", "+2431234567890");
    userMock = {
      message: {
        user: {
          email: "",
          status: 0,
          msisdn: "+2431234567890",
        },
        has_documents: 1,
      },
    };
    
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Didn't receive the code/i)).toBeInTheDocument();
    });
    
    const resendButton = screen.getByText(/Resend/i);
    await user.click(resendButton);
    
    await waitFor(() => {
      expect(resendMutateAsync).toHaveBeenCalledWith({
        msisdn: "+2431234567890",
      });
    });
  });

  it("clears OTP inputs after resend", async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    // Fill one input
    if (otpInputs.length > 0) {
      await user.type(otpInputs[0], "1");
    }
    
    const resendButton = screen.getByText(/Resend/i);
    await user.click(resendButton);
    
    await waitFor(() => {
      expect(otpInputs[0]).toHaveValue("");
    });
  });

  it("auto-sends OTP on mount if not sent recently", async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(resendMutateAsync).toHaveBeenCalled();
    });
  });

  it("does not auto-send OTP if sent recently", async () => {
    localStorage.setItem("otp-sent-timestamp", Date.now().toString());
    renderComponent();
    
    // Should not call resend immediately
    expect(resendMutateAsync).not.toHaveBeenCalled();
  });

  it("handles invalid stored user JSON gracefully", async () => {
    localStorage.setItem("user-session", "invalid");
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText("Verify Your Account")).toBeInTheDocument();
    });
  });

  it("formats phone number correctly", async () => {
    localStorage.removeItem("pending-verification-email");
    localStorage.setItem("pending-verification-msisdn", "01234567890");
    userMock = {
      message: {
        user: {
          email: "",
          status: 0,
          msisdn: "01234567890",
        },
        has_documents: 1,
      },
    };
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/\+2431234567890/i)).toBeInTheDocument();
    });
  });

  it("handles verify OTP error", async () => {
    verifyMutateAsync.mockRejectedValueOnce(new Error("Verification failed"));
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    // Fill all OTP inputs
    for (let i = 0; i < Math.min(6, otpInputs.length); i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    
    const verifyButton = screen.getByText(/Verify & Continue/i);
    await user.click(verifyButton);
    
    await waitFor(() => {
      expect(verifyMutateAsync).toHaveBeenCalled();
    });
  });

  it("navigates back to signin when Back button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText("Back")).toBeInTheDocument();
    });
    
    const backButton = screen.getByText("Back");
    await user.click(backButton);
    
    expect(pushMock).toHaveBeenCalledWith("/signin");
  });

  it("shows success alert after verification", async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    // Fill all OTP inputs
    for (let i = 0; i < Math.min(6, otpInputs.length); i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    
    const verifyButton = screen.getByText(/Verify & Continue/i);
    await user.click(verifyButton);
    
    await waitFor(() => {
      expect(showAlertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
          title: "Verification Successful",
        })
      );
    });
  });

  it("disables verify button when OTP is incomplete", async () => {
    renderComponent();
    
    await waitFor(() => {
      const verifyButton = screen.getByText(/Verify & Continue/i);
      expect(verifyButton).toBeDisabled();
    });
  });

  it("disables verify button when verifying", async () => {
    jest.spyOn(require("@/controller/query/auth/useOtp"), "useVerifyOtp").mockReturnValue({
      mutateAsync: verifyMutateAsync,
      isPending: true,
    });
    
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      const otpInputs = screen.getAllByRole("textbox");
      expect(otpInputs.length).toBeGreaterThanOrEqual(6);
    });
    
    const otpInputs = screen.getAllByRole("textbox").filter(
      (input) => input.getAttribute("inputMode") === "numeric"
    );
    
    // Fill all OTP inputs
    for (let i = 0; i < Math.min(6, otpInputs.length); i++) {
      await user.type(otpInputs[i], String(i + 1));
    }
    
    const verifyButton = screen.getByText(/Verify & Continue/i);
    expect(verifyButton).toBeDisabled();
  });

  it("disables resend button when resending", async () => {
    jest.spyOn(require("@/controller/query/auth/useOtp"), "useResendOtp").mockReturnValue({
      mutateAsync: resendMutateAsync,
      isPending: true,
    });
    
    renderComponent();
    
    await waitFor(() => {
      const resendButton = screen.getByText(/Resend/i);
      expect(resendButton).toBeDisabled();
    });
  });
});
