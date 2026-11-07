"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Stats } from "@/types";
import { axisProps, gridProps, tooltipProps } from "../chartStyles";

export default function SpecializationChart({ data }: { data: Stats["bySpecialization"] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="specialization" {...axisProps} interval={0} angle={-30} textAnchor="end" height={64} />
        <YAxis {...axisProps} allowDecimals={false} />
        <Tooltip {...tooltipProps} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="patients" name="Patients" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={22} />
        <Bar dataKey="doctors" name="Doctors" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
