// Coverage target: 100% lines, branches, functions

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChartTab from "../../../src/components/common/ChartTab";

describe("ChartTab", () => {
  it("renders with default selected option (optionOne)", async () => {
    render(<ChartTab />);
    await waitFor(() => {
      const monthlyButton = screen.getByText("Monthly");
      expect(monthlyButton).toBeInTheDocument();
      expect(monthlyButton).toHaveClass("bg-white");
    });
  });

  it("renders all three options", async () => {
    render(<ChartTab />);
    await waitFor(() => {
      expect(screen.getByText("Monthly")).toBeInTheDocument();
      expect(screen.getByText("Quarterly")).toBeInTheDocument();
      expect(screen.getByText("Annually")).toBeInTheDocument();
    });
  });

  it("changes selection when clicking optionTwo (Quarterly)", async () => {
    const user = userEvent.setup();
    render(<ChartTab />);
    
    await waitFor(() => {
      expect(screen.getByText("Quarterly")).toBeInTheDocument();
    });
    
    const quarterlyButton = screen.getByText("Quarterly");
    await user.click(quarterlyButton);
    
    await waitFor(() => {
      expect(quarterlyButton).toHaveClass("bg-white");
      expect(screen.getByText("Monthly")).not.toHaveClass("bg-white");
    });
  });

  it("changes selection when clicking optionThree (Annually)", async () => {
    const user = userEvent.setup();
    render(<ChartTab />);
    
    await waitFor(() => {
      expect(screen.getByText("Annually")).toBeInTheDocument();
    });
    
    const annuallyButton = screen.getByText("Annually");
    await user.click(annuallyButton);
    
    await waitFor(() => {
      expect(annuallyButton).toHaveClass("bg-white");
      expect(screen.getByText("Monthly")).not.toHaveClass("bg-white");
    });
  });

  it("changes selection back to optionOne (Monthly)", async () => {
    const user = userEvent.setup();
    render(<ChartTab />);
    
    await waitFor(() => {
      expect(screen.getByText("Quarterly")).toBeInTheDocument();
    });
    
    // First select Quarterly
    await user.click(screen.getByText("Quarterly"));
    
    // Then select Monthly
    await waitFor(() => {
      const monthlyButton = screen.getByText("Monthly");
      expect(monthlyButton).toBeInTheDocument();
    });
    
    const monthlyButton = screen.getByText("Monthly");
    await user.click(monthlyButton);
    
    await waitFor(() => {
      expect(monthlyButton).toHaveClass("bg-white");
      expect(screen.getByText("Quarterly")).not.toHaveClass("bg-white");
    });
  });

  it("applies correct classes for selected and unselected states", async () => {
    const user = userEvent.setup();
    render(<ChartTab />);
    
    await waitFor(() => {
      expect(screen.getByText("Monthly")).toBeInTheDocument();
      expect(screen.getByText("Quarterly")).toBeInTheDocument();
    });
    
    const monthlyButton = screen.getByText("Monthly");
    const quarterlyButton = screen.getByText("Quarterly");
    
    // Initially Monthly is selected
    expect(monthlyButton).toHaveClass("bg-white", "dark:bg-gray-800");
    expect(quarterlyButton).toHaveClass("text-gray-500", "dark:text-gray-400");
    
    // Click Quarterly
    await user.click(quarterlyButton);
    
    // Now Quarterly is selected
    await waitFor(() => {
      expect(quarterlyButton).toHaveClass("bg-white", "dark:bg-gray-800");
      expect(monthlyButton).toHaveClass("text-gray-500", "dark:text-gray-400");
    });
  });
});
