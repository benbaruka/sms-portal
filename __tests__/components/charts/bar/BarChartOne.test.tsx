// Coverage target: 100% lines, branches, functions

// Mock react-apexcharts
jest.mock("react-apexcharts", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function MockApexChart({ options, series, type, height }: any) {
      return React.createElement("div", {
        "data-testid": "apex-chart",
        "data-type": type,
        "data-height": height,
        "data-series": JSON.stringify(series),
        "data-options": JSON.stringify(options),
      });
    },
  };
});

// Override the global next/dynamic mock to return the chart component directly
jest.mock("next/dynamic", () => {
  return {
    __esModule: true,
    default: (importFunc: () => Promise<any>) => {
      // Return the mocked component directly instead of a loader
      const MockApexChart = require("react-apexcharts").default;
      return MockApexChart;
    },
  };
});

import { render } from "@testing-library/react";

describe("BarChartOne", () => {
  let BarChartOne: any;

  beforeAll(() => {
    jest.resetModules();
    BarChartOne = require("../../../../src/components/charts/bar/BarChartOne").default;
  });

  it("renders chart component", () => {
    const { getByTestId } = render(<BarChartOne />);
    const chart = getByTestId("apex-chart");
    expect(chart).toBeInTheDocument();
  });

  it("renders with correct chart type", () => {
    const { getByTestId } = render(<BarChartOne />);
    const chart = getByTestId("apex-chart");
    expect(chart).toHaveAttribute("data-type", "bar");
  });

  it("renders with correct height", () => {
    const { getByTestId } = render(<BarChartOne />);
    const chart = getByTestId("apex-chart");
    expect(chart).toHaveAttribute("data-height", "180");
  });

  it("renders with correct series data", () => {
    const { getByTestId } = render(<BarChartOne />);
    const chart = getByTestId("apex-chart");
    const series = JSON.parse(chart.getAttribute("data-series") || "[]");
    
    expect(series).toHaveLength(1);
    expect(series[0]).toHaveProperty("name", "Sales");
    expect(series[0].data).toEqual([168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112]);
  });

  it("renders with correct chart options", () => {
    const { getByTestId } = render(<BarChartOne />);
    const chart = getByTestId("apex-chart");
    const options = JSON.parse(chart.getAttribute("data-options") || "{}");
    
    expect(options.colors).toEqual(["#465fff"]);
    expect(options.chart.type).toBe("bar");
    expect(options.chart.height).toBe(180);
    expect(options.chart.toolbar.show).toBe(false);
    expect(options.xaxis.categories).toHaveLength(12);
    expect(options.xaxis.categories[0]).toBe("Jan");
  });

  it("renders with correct container classes", () => {
    const { container } = render(<BarChartOne />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("custom-scrollbar", "max-w-full", "overflow-x-auto");
  });

  it("renders chart container with correct id and classes", () => {
    const { container } = render(<BarChartOne />);
    const chartContainer = container.querySelector("#chartOne");
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveClass("min-w-[1000px]");
  });
});
