"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface CompletionTrendPoint {
  label: string;
  completionRate: number;
}

export default function CompletionTrendChart({
  data,
}: {
  data: CompletionTrendPoint[];
}) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-neutral-500">
        No completion trend data yet
      </div>
    );
  }

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    colors: ["#16a34a"],
    markers: {
      size: 5,
      colors: ["#16a34a"],
      strokeColors: "#fff",
      strokeWidth: 2,
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(val)}%`,
      offsetY: -8,
      style: { fontSize: "11px", fontWeight: 600 },
      background: { enabled: false },
    },
    xaxis: {
      categories: data.map((d) => d.label),
      labels: {
        rotate: -45,
        rotateAlways: data.length > 4,
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        formatter: (val) => `${Math.round(val)}%`,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}%`,
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
  };

  const series = [
    {
      name: "Completion Rate",
      data: data.map((d) => d.completionRate),
    },
  ];

  return (
    <div className="-mx-2">
      <Chart options={options} series={series} type="line" height={300} />
    </div>
  );
}
