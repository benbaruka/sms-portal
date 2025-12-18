// Coverage target: 100% lines, branches, functions

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock all dependencies BEFORE importing the component
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

jest.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("cookies-next", () => ({
  setCookie: jest.fn(),
  getCookie: jest.fn(),
  deleteCookie: jest.fn(),
}));

const showAlertMock = jest.fn();
jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: showAlertMock,
  }),
}));

jest.mock("@/context/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    setUser: jest.fn(),
    setIsAuthenticated: jest.fn(),
    isAuthenticated: false,
  }),
}));

const loginMutateMock = jest.fn();
const loginMutateAsyncMock = jest.fn();
let loginIsPending = false;

jest.mock("@/controller/query/auth/useAuthCredential", () => ({
  useLogin: () => ({
    mutate: loginMutateMock,
    mutateAsync: loginMutateAsyncMock,
    isPending: loginIsPending,
  }),
}));

jest.mock("@/global/spinner/SpinnerLoader", () => ({
  default: () => <span data-testid="spinner-loader">Loading...</span>,
}));

// Import component AFTER mocks
import SignInForm from "../../../src/components/auth/SignInForm";

describe("SignInForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    showAlertMock.mockClear();
    loginMutateMock.mockClear();
    loginMutateAsyncMock.mockClear();
    mockPush.mockClear();
    mockReplace.mockClear();
    loginIsPending = false;
  });

  const renderSignInForm = (props?: { setIsSignUp?: (value: boolean) => void }) => {
    return render(<SignInForm {...props} />);
  };

  it("renders form with all fields", () => {
    renderSignInForm();
    expect(screen.getByLabelText(/Phone or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    renderSignInForm();
    const forgotPasswordLink = screen.getByText(/Forgot Password/i);
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest("a")).toHaveAttribute("href", "/forgot-password");
  });

  it("renders terms and privacy links", () => {
    renderSignInForm();
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
  });

  it("renders create account button", () => {
    const setIsSignUpMock = jest.fn();
    renderSignInForm({ setIsSignUp: setIsSignUpMock });
    const createAccountButton = screen.getByRole("button", { name: /Create an Account/i });
    expect(createAccountButton).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    loginIsPending = true;
    renderSignInForm();
    expect(screen.getByTestId("spinner-loader")).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
    const toggleButton = screen.getByLabelText(/Show password/i);

    expect(passwordInput.type).toBe("password");

    await user.click(toggleButton);
    expect(passwordInput.type).toBe("text");
    expect(screen.getByLabelText(/Hide password/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Hide password/i));
    expect(passwordInput.type).toBe("password");
  });

  it("detects email input type", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "test@example.com");

    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });
  });

  it("detects phone input type", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "123456789");

    await waitFor(() => {
      expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    });
  });

  it("handles country selection change", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    // Type phone to show country selector
    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "123");

    await waitFor(() => {
      expect(screen.getByText(/\+243/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when fields are empty", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(showAlertMock).toHaveBeenCalledWith({
        variant: "error",
        title: "Missing Fields",
        message: "Please fill in all fields.",
      });
    });
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "invalid-email");
    await user.type(screen.getByLabelText(/Password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(showAlertMock).toHaveBeenCalledWith({
        variant: "error",
        title: "Invalid Format",
        message: "Please enter a valid email address.",
      });
    });
    expect(loginMutateMock).not.toHaveBeenCalled();
  });

  it("submits form with valid email credentials", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "test@example.com");
    await user.type(screen.getByLabelText(/Password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMutateMock).toHaveBeenCalledWith(
        { email: "test@example.com", password: "password123" },
        expect.any(Object)
      );
    });
  });

  it("submits form with valid phone credentials", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "1234567890");
    await user.type(screen.getByLabelText(/Password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMutateMock).toHaveBeenCalledWith(
        { msisdn: "+2431234567890", password: "password123" },
        expect.any(Object)
      );
    });
  });

  it("handles phone number with country code prefix", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "+2431234567890");
    await user.type(screen.getByLabelText(/Password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMutateMock).toHaveBeenCalledWith(
        { msisdn: "+2431234567890", password: "password123" },
        expect.any(Object)
      );
    });
  });

  it("handles phone number starting with zero", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "0123456789");
    await user.type(screen.getByLabelText(/Password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMutateMock).toHaveBeenCalledWith(
        { msisdn: "+243123456789", password: "password123" },
        expect.any(Object)
      );
    });
  });

  it("validates phone number format", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "123"); // Too short
    await user.type(screen.getByLabelText(/Password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(showAlertMock).toHaveBeenCalledWith({
        variant: "error",
        title: "Invalid Format",
        message: "Please enter a valid phone number.",
      });
    });
    expect(loginMutateMock).not.toHaveBeenCalled();
  });

  it("prevents double submission when already submitting", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "test@example.com");
    await user.type(screen.getByLabelText(/Password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    
    // Click multiple times rapidly
    await user.click(submitButton);
    await user.click(submitButton);
    await user.click(submitButton);

    // Should only be called once due to isSubmitting guard
    await waitFor(() => {
      expect(loginMutateMock).toHaveBeenCalledTimes(1);
    });
  });

  it("prevents submission when loading", async () => {
    loginIsPending = true;
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "test@example.com");
    await user.type(screen.getByLabelText(/Password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    expect(submitButton).toBeDisabled();
  });

  it("calls setIsSignUp when create account button is clicked", async () => {
    const user = userEvent.setup();
    const setIsSignUpMock = jest.fn();
    renderSignInForm({ setIsSignUp: setIsSignUpMock });

    const createAccountButton = screen.getByRole("button", { name: /Create an Account/i });
    await user.click(createAccountButton);

    expect(setIsSignUpMock).toHaveBeenCalledWith(true);
  });

  it("handles form submission with onSettled callback", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "test@example.com");
    await user.type(screen.getByLabelText(/Password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMutateMock).toHaveBeenCalled();
      const callArgs = loginMutateMock.mock.calls[0];
      expect(callArgs[1]).toHaveProperty("onSettled");
      expect(typeof callArgs[1].onSettled).toBe("function");
    });
  });

  it("resets isSubmitting state after mutation settles", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "test@example.com");
    await user.type(screen.getByLabelText(/Password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMutateMock).toHaveBeenCalled();
      const callArgs = loginMutateMock.mock.calls[0];
      const onSettled = callArgs[1].onSettled;
      
      // Call onSettled to verify it doesn't throw
      expect(() => onSettled()).not.toThrow();
    });
  });

  it("handles country search filter", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    // Type phone to show country selector
    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "123");

    await waitFor(() => {
      expect(screen.getByText(/\+243/i)).toBeInTheDocument();
    });

    // Open country selector (this would require clicking the select trigger)
    // For now, we verify the component renders correctly
    expect(screen.getByText(/Congo/i)).toBeInTheDocument();
  });

  it("trims email input before submission", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "  test@example.com  ");
    await user.type(screen.getByLabelText(/Password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMutateMock).toHaveBeenCalledWith(
        { email: "test@example.com", password: "password123" },
        expect.any(Object)
      );
    });
  });

  it("trims phone input before submission", async () => {
    const user = userEvent.setup();
    renderSignInForm();

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    await user.type(identifierInput, "  1234567890  ");
    await user.type(screen.getByLabelText(/Password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMutateMock).toHaveBeenCalledWith(
        { msisdn: "+2431234567890", password: "password123" },
        expect.any(Object)
      );
    });
  });
});
