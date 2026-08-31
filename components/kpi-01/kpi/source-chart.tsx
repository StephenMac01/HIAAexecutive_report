"use client";

import { Cell, Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import type { Kpi01Summary, Kpi01SourceDatum } from "@/lib/kpi-01/kpi-data";

const COLORS = ["var(--chart-1)", "var(--chart-4)", "var(--chart-5)"];

const chartConfig = {
  total: {
    label: "Records",
  },

  "HIAA Annual Report": {
    label: "HIAA Annual Report",
    color: "var(--chart-1)",
  },

  "Public Complaint": {
    label: "Public Complaint",
    color: "var(--chart-4)",
  },

  "Operational Report": {
    label: "Operational Report",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function SourceChart({
  summary,
  sourceBreakdown,
}: {
  summary: Kpi01Summary;
  sourceBreakdown: Kpi01SourceDatum[];
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Records by Source</CardTitle>

        <CardDescription>
          Origin of the reported events under review
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[280px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="source" hideLabel />}
            />

            <Pie
              data={sourceBreakdown}
              dataKey="total"
              nameKey="source"
              innerRadius={62}
              strokeWidth={4}
            >
              {sourceBreakdown.map((entry, i) => (
                <Cell key={entry.source} fill={COLORS[i % COLORS.length]} />
              ))}

              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {summary.totalRecords}
                        </tspan>

                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 22}
                          className="fill-muted-foreground text-xs"
                        >
                          Records
                        </tspan>
                      </text>
                    );
                  }

                  return null;
                }}
              />
            </Pie>

            <ChartLegend content={<ChartLegendContent nameKey="source" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
