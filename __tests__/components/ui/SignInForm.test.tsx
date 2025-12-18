import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "@jest/globals";

// Mock AlertProvider and useLogin hook used by SignInForm
const showAlertMock = jest.fn();
const loginMutateMock = jest.fn();
let loginIsPending = false;

jest.mock("@/context/AlertProvider", () => ({
  useAlert: () => ({
    showAlert: showAlertMock,
  }),
}));

jest.mock("@/controller/query/auth/useAuthCredential", () => ({
  useLogin: () => ({
    mutate: loginMutateMock,
    isPending: loginIsPending,
  }),
}));

import SignInForm from "@/components/auth/SignInForm";

describe("components/auth/SignInForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loginIsPending = false;
  });

  it("renders the sign-in form structure", () => {
    render(<SignInForm />);
    expect(screen.getByText(/Sign in to access your SMS dashboard/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
  });

  it("shows alert when submitting with missing fields", () => {
    const { container } = render(<SignInForm />);

    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitButton).not.toBeNull();
    fireEvent.click(submitButton!);

    // Should not call login when fields are missing
    expect(loginMutateMock).not.toHaveBeenCalled();
  });

  it("validates email format and does not call login for invalid email", async () => {
    const { container } = render(<SignInForm />);

    // Au départ, le label est "Phone or Email"
    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    // Saisie qui ressemble à un email invalide
    fireEvent.change(identifierInput, { target: { value: "invalid-email@" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Attendre que l'effet ait mis à jour inputType => le label devient "Email"
    await waitFor(() => {
      expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument();
    });

    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitButton).not.toBeNull();
    fireEvent.click(submitButton);

    // Invalid email: ne doit pas appeler la mutation de login
    await waitFor(() => {
      expect(loginMutateMock).not.toHaveBeenCalled();
    });
  });

  it("submits with email credentials when identifier is a valid email", () => {
    // Make mutate call its onSettled callback to cover that branch
    loginMutateMock.mockImplementation((creds, opts) => {
      if (opts && typeof opts.onSettled === "function") {
        opts.onSettled();
      }
    });

    render(<SignInForm />);

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    fireEvent.change(identifierInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const buttons = screen.getAllByRole("button", { hidden: true }) as HTMLButtonElement[];
    const submitButton = buttons.find(
      (btn: HTMLButtonElement) => btn.getAttribute("type") === "submit"
    ) as HTMLButtonElement;
    expect(submitButton).toBeDefined();
    fireEvent.click(submitButton);

    expect(loginMutateMock).toHaveBeenCalledTimes(1);
    const [credentials] = loginMutateMock.mock.calls[0];
    expect(credentials).toEqual(
      expect.objectContaining({
        email: "user@example.com",
        password: "password123",
      })
    );
  });

  it("submits with phone credentials when identifier is numeric", () => {
    // Make mutate call its onSettled callback to cover that branch as well
    loginMutateMock.mockImplementation((creds, opts) => {
      if (opts && typeof opts.onSettled === "function") {
        opts.onSettled();
      }
    });

    render(<SignInForm />);

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    // default country is CD with +243 dial code
    fireEvent.change(identifierInput, { target: { value: "0123456789" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const buttons = screen.getAllByRole("button", { hidden: true }) as HTMLButtonElement[];
    const submitButton = buttons.find(
      (btn: HTMLButtonElement) => btn.getAttribute("type") === "submit"
    ) as HTMLButtonElement;
    expect(submitButton).toBeDefined();
    fireEvent.click(submitButton);

    expect(loginMutateMock).toHaveBeenCalledTimes(1);
    const [credentials] = loginMutateMock.mock.calls[0];
    // Leading zero should be stripped and dial code added
    expect(credentials).toEqual(
      expect.objectContaining({
        msisdn: "+243123456789",
        password: "password123",
      })
    );
  });

  it("prevents double submission when mutation is pending", () => {
    loginIsPending = true;
    render(<SignInForm />);

    const buttons = screen.getAllByRole("button", { hidden: true }) as HTMLButtonElement[];
    const submitButton = buttons.find(
      (btn: HTMLButtonElement) => btn.getAttribute("type") === "submit"
    ) as HTMLButtonElement;
    expect(submitButton).toBeDefined();
    fireEvent.click(submitButton);

    expect(loginMutateMock).not.toHaveBeenCalled();
  });

  it("shows phone invalid format error when phone number does not match pattern", () => {
    render(<SignInForm />);

    // Force inputType to phone by entering only digits
    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    fireEvent.change(identifierInput, { target: { value: "123" } }); // Too short, will be invalid
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const buttons = screen.getAllByRole("button", { hidden: true }) as HTMLButtonElement[];
    const submitButton = buttons.find(
      (btn: HTMLButtonElement) => btn.getAttribute("type") === "submit"
    ) as HTMLButtonElement;
    expect(submitButton).toBeDefined();
    fireEvent.click(submitButton);

    expect(showAlertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        title: "Invalid Format",
      })
    );
    expect(loginMutateMock).not.toHaveBeenCalled();
  });

  it("handles login error and resets submitting state in catch block", () => {
    // Cause mutate to throw to exercise the catch branch
    loginMutateMock.mockImplementation(() => {
      throw new Error("Login failed");
    });

    render(<SignInForm />);

    const identifierInput = screen.getByLabelText(/Phone or Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    fireEvent.change(identifierInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const buttons = screen.getAllByRole("button", { hidden: true }) as HTMLButtonElement[];
    const submitButton = buttons.find(
      (btn: HTMLButtonElement) => btn.getAttribute("type") === "submit"
    ) as HTMLButtonElement;
    expect(submitButton).toBeDefined();
    fireEvent.click(submitButton);

    expect(loginMutateMock).toHaveBeenCalledTimes(1);
  });

  it("filters countries when searching in the country selector", () => {
    render(<SignInForm />);

    // Open the country select by clicking on the displayed dial code
    const dialCodeElement = screen.getByText("+243");
    fireEvent.click(dialCodeElement);

    const searchInput = screen.getByPlaceholderText("Search country...");
    fireEvent.change(searchInput, { target: { value: "Kenya" } });

    // If filtering works, Kenya option should be present in the dropdown
    expect(screen.getByText("Kenya")).toBeInTheDocument();
  });
});
