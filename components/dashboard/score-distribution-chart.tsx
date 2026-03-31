"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { ScoreDistribution } from "@/lib/queries/dashboard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ScoreDistributionChartProps {
  data: ScoreDistribution;
}

export default function ScoreDistributionChart({
  data,
}: ScoreDistributionChartProps) {
  const total =
    data.atRisk + data.basic + data.functional + data.strong + data.expert;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-neutral-500">
        No completed assessments yet
      </div>
    );
  }

  const labels = ["At Risk", "Basic", "Functional", "Strong", "Expert"];
  const values = [
    data.atRisk,
    data.basic,
    data.functional,
    data.strong,
    data.expert,
  ];
  const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e", "#16a34a"];

  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      height: 280,
    },
    labels,
    colors,
    dataLabels: {
      enabled: true,
      formatter: (val, opts) => {
        const count = opts.w.globals.series[opts.seriesIndex];
        return count > 0 ? `${count}` : "";
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "55%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: 700,
              formatter: (val) => val,
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 600,
              formatter: () => `${total}`,
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      fontSize: "13px",
      markers: {
        size: 8,
        offsetX: -2,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} employees`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <div className="-mx-2">
      <Chart options={chartOptions} series={values} type="donut" height={280} />
    </div>
  );
}
