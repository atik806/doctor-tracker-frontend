"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Stats } from "@/types";
import { axisProps, gridProps, tooltipProps } from "../chartStyles";

type DoctorBar = Stats["patientsPerDoctor"][number];

/** "Dr. Ayesha Rahman" → "A. Rahman", so long names fit beside the bars. */
function shortName(name: string) {
  const words = name.replace(/^Dr\.\s*/, "").split(" ");
  if (words.length < 2) return words[0];
  return `${words[0][0]}. ${words[words.length - 1]}`;
}

export default function PatientsPerDoctorChart({ data }: { data: DoctorBar[] }) {
  const router = useRouter();
  // Only rebuild the rows when the data changes, not on every render.
  const rows = useMemo(() => data.map((item) => ({ ...item, shortName: shortName(item.name) })), [data]);

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, rows.length * 34)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid {...gridProps} vertical horizontal={false} />
        <XAxis type="number" {...axisProps} allowDecimals={false} />
        <YAxis type="category" dataKey="shortName" {...axisProps} width={96} />
        <Tooltip {...tooltipProps} labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ""} />
        <Bar
          dataKey="patients"
          name="Patients"
          fill="var(--chart-1)"
          radius={[0, 6, 6, 0]}
          barSize={18}
          className="cursor-pointer"
          onClick={(entry) => {
            const id = (entry as { payload?: DoctorBar }).payload?.id;
            if (id) router.push(`/doctors/${id}`);
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
