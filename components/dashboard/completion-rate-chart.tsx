"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface CompletionRateChartProps {
  rate: number;
  completed: number;
  total: number;
}

function getRateColor(rate: number): string {
  if (rate >= 80) return "#16a34a";
  if (rate >= 60) return "#3b82f6";
  if (rate >= 40) return "#f59e0b";
  return "#ef4444";
}

export default function CompletionRateChart({
  rate,
  completed,
  total,
}: CompletionRateChartProps) {
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-neutral-500">
        No employees invited yet
      </div>
    );
  }

  const color = getRateColor(rate);

  const chartOptions: ApexOptions = {
    chart: {
      type: "radialBar",
      height: 200,
      sparkline: {
        enabled: true,
      },
    },
    colors: [color],
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "60%",
        },
        track: {
          background: "#e5e7eb",
          strokeWidth: "100%",
          margin: 0,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "14px",
            fontWeight: 500,
            color: "#6b7280",
            offsetY: 20,
          },
          value: {
            show: true,
            fontSize: "28px",
            fontWeight: 700,
            color: color,
            offsetY: -20,
            formatter: () => `${rate}%`,
          },
        },
      },
    },
    labels: [`${completed} of ${total}`],
    stroke: {
      lineCap: "round",
    },
  };

  return (
    <div className="-mb-8">
      <Chart
        options={chartOptions}
        series={[rate]}
        type="radialBar"
        height={200}
      />
    </div>
  );
}
