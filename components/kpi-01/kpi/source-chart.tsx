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
import type { Kpi01SourceDatum, Kpi01Summary } from "@/lib/kpi-01/kpi-data";

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

type SourceChartProps = {
  summary: Kpi01Summary;
  sourceBreakdown: Kpi01SourceDatum[];
};

export function SourceChart({ summary, sourceBreakdown }: SourceChartProps) {
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
              {sourceBreakdown.map((entry, index) => (
                <Cell key={entry.source} fill={COLORS[index % COLORS.length]} />
              ))}

              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                    return null;
                  }

                  const centerX = viewBox.cx ?? 0;
                  const centerY = viewBox.cy ?? 0;

                  return (
                    <text
                      x={centerX}
                      y={centerY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={centerX}
                        y={centerY}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {summary.totalRecords}
                      </tspan>

                      <tspan
                        x={centerX}
                        y={centerY + 22}
                        className="fill-muted-foreground text-xs"
                      >
                        Records
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>

            <ChartLegend
              content={
                <ChartLegendContent nameKey="source" className="flex-wrap" />
              }
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
