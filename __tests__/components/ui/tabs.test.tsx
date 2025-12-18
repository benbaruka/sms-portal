import { renderWithProviders, screen, waitFor } from "../../test-utils";
import { within } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../src/components/ui/tabs";

describe("components/ui/tabs.tsx", () => {
  it("renders tabs component", async () => {
    const { container } = renderWithProviders(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    await waitFor(() => {
      expect(within(container).getAllByText("Tab 1")[0]).toBeInTheDocument();
      expect(within(container).getAllByText("Tab 2")[0]).toBeInTheDocument();
    });
  });

  it("renders active tab content by default", async () => {
    const { container } = renderWithProviders(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    await waitFor(() => {
      expect(within(container).getAllByText("Content 1")[0]).toBeInTheDocument();
    });
  });

  it("switches tab content when trigger is clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab2 = within(container).getAllByText("Tab 2")[0];
    await user.click(tab2);

    await waitFor(() => {
      expect(screen.queryByText("Content 2")).toBeInTheDocument();
    });
  });

  it("applies custom className to TabsList", async () => {
    const { container } = renderWithProviders(
      <Tabs>
        <TabsList className="custom-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    await waitFor(() => {
      expect(container.querySelector(".custom-list")).toBeInTheDocument();
    });
  });

  it("applies custom className to TabsTrigger", () => {
    const { container } = renderWithProviders(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1" className="custom-trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const trigger = within(container).getAllByText("Tab 1")[0];
    expect(trigger).toHaveClass("custom-trigger");
  });

  it("applies custom className to TabsContent", async () => {
    const { container } = renderWithProviders(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">
          Content
        </TabsContent>
      </Tabs>
    );
    await waitFor(() => {
      expect(container.querySelector(".custom-content")).toBeInTheDocument();
    });
  });

  it("renders multiple tabs correctly", async () => {
    const { container } = renderWithProviders(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );
    await waitFor(() => {
      expect(within(container).getAllByText("Tab 1")[0]).toBeInTheDocument();
      expect(within(container).getAllByText("Tab 2")[0]).toBeInTheDocument();
      expect(within(container).getAllByText("Tab 3")[0]).toBeInTheDocument();
    });
  });
});
