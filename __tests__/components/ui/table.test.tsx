import { renderWithProviders, screen, waitFor } from "../../test-utils";
import { within } from "@testing-library/dom";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "../../../src/components/ui/table";

describe("components/ui/table.tsx", () => {
  it("renders table component", async () => {
    renderWithProviders(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    await waitFor(() => {
      const headerCells = screen.getAllByText("Header");
      expect(headerCells[0]).toBeInTheDocument();
      const bodyCells = screen.getAllByText("Cell");
      expect(bodyCells[0]).toBeInTheDocument();
    });
  });

  it("renders table with caption", async () => {
    renderWithProviders(
      <Table>
        <TableCaption>Table Caption</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    await waitFor(() => {
      expect(screen.queryByText("Table Caption")).toBeInTheDocument();
    });
  });

  it("renders table with footer", async () => {
    const { container } = renderWithProviders(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Footer</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    await waitFor(() => {
      // prefer the footer cell inside the table rather than any "Footer" text on the page
      const footerCells = within(container).getAllByText("Footer");
      expect(footerCells[0]).toBeInTheDocument();
    });
  });

  it("renders complete table structure", async () => {
    const { container } = renderWithProviders(
      <Table>
        <TableCaption>Test Table</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    await waitFor(() => {
      // header cell "Name" should exist in the table header
      expect(
        within(container).getAllByRole("columnheader", { name: "Name" })[0],
      ).toBeInTheDocument();
      expect(within(container).getAllByText("John")[0]).toBeInTheDocument();
      expect(within(container).getAllByText("Total")[0]).toBeInTheDocument();
    });
  });

  it("applies custom className to table", () => {
    const { container } = renderWithProviders(
      <Table className="custom-table">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const table = container.querySelector("table");
    expect(table).toHaveClass("custom-table");
  });

  it("renders multiple rows", async () => {
    renderWithProviders(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Row 1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Row 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    await waitFor(() => {
      const row1 = screen.getAllByText("Row 1")[0];
      const row2 = screen.getAllByText("Row 2")[0];
      expect(row1).toBeInTheDocument();
      expect(row2).toBeInTheDocument();
    });
  });
});
