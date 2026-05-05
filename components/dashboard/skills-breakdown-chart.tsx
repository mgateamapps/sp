"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { SkillBreakdown } from "@/lib/queries/dashboard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SkillsBreakdownChartProps {
  data: SkillBreakdown | null;
}

function getBarColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export default function SkillsBreakdownChart({
  data,
}: SkillsBreakdownChartProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-[280px] text-neutral-500">
        No assessment data yet
      </div>
    );
  }

  const categories = [
    "Clarity",
    "Context",
    "Constraints",
    "Output Format",
    "Verification",
  ];
  const values = [
    data.clarity,
    data.context,
    data.constraints,
    data.outputFormat,
    data.verification,
  ];

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 280,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "60%",
        distributed: true,
      },
    },
    colors: values.map((v) => getBarColor(v)),
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}`,
      style: {
        fontSize: "12px",
        fontWeight: 600,
      },
    },
    xaxis: {
      categories,
      max: 100,
      labels: {
        formatter: (val) => `${val}`,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "13px",
        },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => `${val}/100`,
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
  };

  const chartSeries = [
    {
      name: "Score",
      data: values,
    },
  ];

  return (
    <div className="-mx-2">
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="bar"
        height={280}
      />
    </div>
  );
}
