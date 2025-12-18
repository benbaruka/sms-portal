import { renderWithProviders, screen, waitFor } from "../../test-utils";
import { userEvent } from "@testing-library/user-event";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../../../src/components/ui/collapsible";

describe("components/ui/collapsible.tsx", () => {
  it("renders collapsible component", async () => {
    renderWithProviders(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    await waitFor(() => {
      expect(screen.queryByText("Toggle")).toBeInTheDocument();
    });
  });

  it("shows/hides content when toggled", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.queryByText("Toggle");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.queryByText("Hidden Content")).toBeInTheDocument();
    });
  });

  it("renders with open state", async () => {
    renderWithProviders(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    await waitFor(() => {
      expect(screen.queryByText("Content")).toBeInTheDocument();
    });
  });

  it("handles controlled open state", async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithProviders(
      <Collapsible open={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    expect(screen.queryByText("Content")).not.toBeInTheDocument();

    rerender(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    await waitFor(() => {
      expect(screen.queryByText("Content")).toBeInTheDocument();
    });
  });
});
