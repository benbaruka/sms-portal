import { renderWithProviders } from "../../test-utils";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../src/components/ui/chart";

describe("components/ui/chart.tsx", () => {
  it("renders chart container", () => {
    const { container } = renderWithProviders(
      <div style={{ width: 500, height: 300 }}>
        <ChartContainer config={{}}>
          <div>Chart</div>
        </ChartContainer>
      </div>
    );
    expect(container.textContent).toContain("Chart");
  });

  it("renders chart with tooltip", () => {
    const { container } = renderWithProviders(
      <div style={{ width: 500, height: 300 }}>
        <ChartContainer config={{}}>
          <ChartTooltip>
            <ChartTooltipContent />
          </ChartTooltip>
        </ChartContainer>
      </div>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies config to chart", () => {
    const config: ChartConfig = {
      sales: {
        label: "Sales",
        color: "hsl(var(--chart-1))",
      },
    };
    const { container } = renderWithProviders(
      <div style={{ width: 500, height: 300 }}>
        <ChartContainer config={config}>
          <div>Chart</div>
        </ChartContainer>
      </div>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
