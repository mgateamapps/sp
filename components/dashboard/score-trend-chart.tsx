"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { ScoreTrendPoint } from "@/lib/queries/dashboard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ScoreTrendChartProps {
  data: ScoreTrendPoint[];
}

export default function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-neutral-500">
        No campaign data yet
      </div>
    );
  }

  const chartOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 300,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    colors: ["#3b82f6"],
    markers: {
      size: 6,
      colors: ["#3b82f6"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}`,
      offsetY: -10,
      style: {
        fontSize: "12px",
        fontWeight: 600,
        colors: ["#374151"],
      },
      background: {
        enabled: false,
      },
    },
    xaxis: {
      categories: data.map((d) => d.campaignName),
      labels: {
        style: {
          fontSize: "12px",
        },
        rotate: -45,
        rotateAlways: data.length > 4,
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        formatter: (val) => `${Math.round(val)}`,
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => `${val} / 100`,
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
    annotations: {
      yaxis: [
        {
          y: 60,
          borderColor: "#f59e0b",
          borderWidth: 1,
          strokeDashArray: 5,
          label: {
            borderColor: "#f59e0b",
            style: {
              color: "#fff",
              background: "#f59e0b",
              fontSize: "10px",
            },
            text: "Functional",
            position: "left",
          },
        },
        {
          y: 80,
          borderColor: "#16a34a",
          borderWidth: 1,
          strokeDashArray: 5,
          label: {
            borderColor: "#16a34a",
            style: {
              color: "#fff",
              background: "#16a34a",
              fontSize: "10px",
            },
            text: "Strong",
            position: "left",
          },
        },
      ],
    },
  };

  const chartSeries = [
    {
      name: "Average Score",
      data: data.map((d) => d.averageScore),
    },
  ];

  return (
    <div className="-mx-2">
      <Chart options={chartOptions} series={chartSeries} type="line" height={300} />
    </div>
  );
}
