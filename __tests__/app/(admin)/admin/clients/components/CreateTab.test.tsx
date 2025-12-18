import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { MockedFunction } from "@jest/globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import CreateTab from "../../../../../../src/app/(admin)/admin/clients/components/CreateTab";
import * as clientHooks from "../../../../../../src/controller/query/admin/clients/useAdminClients";
import * as userHooks from "../../../../../../src/controller/query/admin/users/useAdminUsers";
import { renderWithProviders } from "../../../../../test-utils";

const mockPush = jest.fn();
const mockMutateAsyncClient = jest.fn();
const mockMutateAsyncUser = jest.fn();

jest.mock("@/controller/query/admin/clients/useAdminClients", () => ({
  useAdminClientAccountTypes: jest.fn(),
  useAdminClientCountries: jest.fn(),
  useCreateAdminClient: jest.fn(),
}));

jest.mock("@/controller/query/admin/users/useAdminUsers", () => ({
  useAdminUserRoles: jest.fn(),
  useAdminUserClients: jest.fn(),
  useCreateAdminUser: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock cookies-next
jest.mock("cookies-next", () => ({
  setCookie: jest.fn(),
  getCookie: jest.fn(),
  deleteCookie: jest.fn(),
}));

describe("CreateTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders CreateTab component", async () => {
    renderWithProviders(<CreateTab />);
    expect(await screen.findByText(/Create New/i)).toBeInTheDocument();
  });

  it("renders client and user tabs", async () => {
    renderWithProviders(<CreateTab />);
    expect(await screen.findByRole("tab", { name: /Client/i })).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: /User/i })).toBeInTheDocument();
  });

  it("switches between client and user tabs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTab />);

    const userTab = await screen.findByRole("tab", { name: /User/i });
    await user.click(userTab);

    expect(await screen.findByText(/Full name/i)).toBeInTheDocument();
  });

  it("renders client form fields", async () => {
    renderWithProviders(<CreateTab />);

    expect(await screen.findByLabelText(/Company name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders user form fields when user tab is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTab />);

    const userTab = await screen.findByRole("tab", { name: /User/i });
    await user.click(userTab);

    expect(await screen.findByLabelText(/Full name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).toBeInTheDocument();
  });

  it("handles client form submission", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTab />);

    const nameInput = await screen.findByLabelText(/Company name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);

    await user.type(nameInput, "Test Company");
    await user.type(emailInput, "test@example.com");
    await user.type(phoneInput, "+243900000000");

    const countrySelect = screen.getByLabelText(/Country/i);
    await user.click(countrySelect);

    const congoOption = await screen.findByText(/Congo/i);
    await user.click(congoOption);

    const accountTypeSelect = screen.getByLabelText(/Account tier/i);
    await user.click(accountTypeSelect);

    const premiumOption = await screen.findByText("Premium");
    await user.click(premiumOption);

    const submitBtn = screen.getByRole("button", { name: /Create client/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    // Check if mutation was called (async)
    await waitFor(() => {
      expect(mockMutateAsyncClient).toHaveBeenCalled();
    });
  });

  it("handles user form submission", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTab />);

    const userTab = await screen.findByRole("tab", { name: /User/i });
    await user.click(userTab);

    const nameInput = await screen.findByLabelText(/Full name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const phoneInput = screen.getByLabelText(/phone/i);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");
    await user.type(phoneInput, "+243900000000");

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);

    const adminOption = await screen.findByText("Admin");
    await user.click(adminOption);

    const clientSelect = screen.getByLabelText(/Client space/i);
    await user.click(clientSelect);

    const testClientOption = await screen.findByText("Test Client");
    await user.click(testClientOption);

    const submitBtn = screen.getByRole("button", { name: /Create user/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsyncUser).toHaveBeenCalled();
    });
  });

  it("handles client form validation - missing country", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTab />);

    const nameInput = await screen.findByLabelText(/Company name/i);
    await user.type(nameInput, "Test Company");

    // Interact with form but skip country
    const accountTypeSelect = screen.getByLabelText(/Account tier/i);
    await user.click(accountTypeSelect);

    const premiumOption = await screen.findByText("Premium");
    await user.click(premiumOption);

    const submitBtn = screen.getByRole("button", { name: /Create client/i });
    await user.click(submitBtn);

    // Should NOT have called mutation
    expect(mockMutateAsyncClient).not.toHaveBeenCalled();
  });

  it("handles user form validation - password too short", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTab />);

    const userTab = await screen.findByRole("tab", { name: /User/i });
    await user.click(userTab);

    const passwordInput = await screen.findByLabelText(/password/i);
    await user.type(passwordInput, "123");

    const submitBtn = screen.getByRole("button", { name: /Create user/i });
    await user.click(submitBtn);

    expect(mockMutateAsyncUser).not.toHaveBeenCalled();
  });

  it("handles form submission without apiKey", async () => {
    const user = userEvent.setup();
    localStorage.removeItem("apiKey");
    renderWithProviders(<CreateTab />);

    const submitBtn = await screen.findByRole("button", { name: /Create client/i });
    await user.click(submitBtn);

    expect(mockMutateAsyncClient).not.toHaveBeenCalled();
  });

  it("handles notes input for client form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTab />);

    const notesInput = await screen.findByLabelText(/notes/i);
    await user.type(notesInput, "Test notes");

    expect(notesInput).toHaveValue("Test notes");
  });

  it("handles notes input for user form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTab />);

    const userTab = await screen.findByRole("tab", { name: /User/i });
    await user.click(userTab);

    const notesInput = await screen.findByLabelText(/notes/i);
    await user.type(notesInput, "User notes");

    expect(notesInput).toHaveValue("User notes");
  });

  it("handles loading states for account types", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (clientHooks.useAdminClientAccountTypes as MockedFunction<any>).mockReturnValue({
      data: { data: [] },
      isLoading: true,
    });
    renderWithProviders(<CreateTab />);
    expect(await screen.findByText(/Create New/i)).toBeInTheDocument();
  });

  it("handles loading states for countries", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (clientHooks.useAdminClientCountries as MockedFunction<any>).mockReturnValue({
      data: { data: [] },
      isLoading: true,
    });
    renderWithProviders(<CreateTab />);
    expect(await screen.findByText(/Create New/i)).toBeInTheDocument();
  });

  it("handles loading states for roles", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (userHooks.useAdminUserRoles as MockedFunction<any>).mockReturnValue({
      data: { data: [] },
      isLoading: true,
    });
    const user = userEvent.setup();
    renderWithProviders(<CreateTab />);

    const userTab = await screen.findByRole("tab", { name: /User/i });
    await user.click(userTab);

    expect(await screen.findByText(/Full name/i)).toBeInTheDocument();
  });

  it("handles loading states for clients", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (userHooks.useAdminUserClients as MockedFunction<any>).mockReturnValue({
      data: { data: [] },
      isLoading: true,
    });
    const user = userEvent.setup();
    renderWithProviders(<CreateTab />);

    const userTab = await screen.findByRole("tab", { name: /User/i });
    await user.click(userTab);

    expect(await screen.findByText(/Full name/i)).toBeInTheDocument();
  });
});
