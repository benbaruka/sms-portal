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

describe("LineChartOne", () => {
  let LineChartOne: any;

  beforeAll(() => {
    jest.resetModules();
    LineChartOne = require("../../../../src/components/charts/line/LineChartOne").default;
  });

  it("renders chart component", () => {
    const { getByTestId } = render(<LineChartOne />);
    const chart = getByTestId("apex-chart");
    expect(chart).toBeInTheDocument();
  });

  it("renders with correct chart type", () => {
    const { getByTestId } = render(<LineChartOne />);
    const chart = getByTestId("apex-chart");
    expect(chart).toHaveAttribute("data-type", "area");
  });

  it("renders with correct height", () => {
    const { getByTestId } = render(<LineChartOne />);
    const chart = getByTestId("apex-chart");
    expect(chart).toHaveAttribute("data-height", "310");
  });

  it("renders with correct series data", () => {
    const { getByTestId } = render(<LineChartOne />);
    const chart = getByTestId("apex-chart");
    const series = JSON.parse(chart.getAttribute("data-series") || "[]");
    
    expect(series).toHaveLength(2);
    expect(series[0]).toHaveProperty("name", "Sales");
    expect(series[0].data).toEqual([180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235]);
    expect(series[1]).toHaveProperty("name", "Revenue");
    expect(series[1].data).toEqual([40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140]);
  });

  it("renders with correct chart options", () => {
    const { getByTestId } = render(<LineChartOne />);
    const chart = getByTestId("apex-chart");
    const options = JSON.parse(chart.getAttribute("data-options") || "{}");
    
    expect(options.colors).toEqual(["#465FFF", "#9CB9FF"]);
    expect(options.chart.type).toBe("line");
    expect(options.chart.height).toBe(310);
    expect(options.chart.toolbar.show).toBe(false);
    expect(options.legend.show).toBe(false);
    expect(options.xaxis.categories).toHaveLength(12);
    expect(options.xaxis.categories[0]).toBe("Jan");
  });

  it("renders with correct container classes", () => {
    const { container } = render(<LineChartOne />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("custom-scrollbar", "max-w-full", "overflow-x-auto");
  });

  it("renders chart container with correct id and classes", () => {
    const { container } = render(<LineChartOne />);
    const chartContainer = container.querySelector("#chartEight");
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveClass("min-w-[1000px]");
  });
});
