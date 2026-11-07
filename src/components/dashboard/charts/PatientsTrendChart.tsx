"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@/types";
import { axisProps, gridProps, tooltipProps } from "../chartStyles";

export default function PatientsTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="patientsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} minTickGap={24} />
        <YAxis {...axisProps} allowDecimals={false} />
        <Tooltip {...tooltipProps} cursor={{ stroke: "var(--border-strong)" }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Area
          type="monotone"
          dataKey="patients"
          name="New patients"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#patientsFill)"
        />
        <Area
          type="monotone"
          dataKey="doctors"
          name="New doctors"
          stroke="var(--chart-2)"
          strokeWidth={2}
          fill="transparent"
          strokeDasharray="4 3"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
