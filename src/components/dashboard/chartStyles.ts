/* Shared Recharts styling so every chart looks the same. Colours come from the CSS tokens. */

export const axisProps = {
  tick: { fill: "var(--muted)", fontSize: 12 },
  tickLine: false,
  axisLine: false,
};

export const gridProps = {
  stroke: "var(--border)",
  strokeDasharray: "3 3",
  vertical: false,
};

export const tooltipProps = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    boxShadow: "var(--shadow-pop)",
    fontSize: 13,
  },
  labelStyle: { color: "var(--foreground)", fontWeight: 600, marginBottom: 4 },
  cursor: { fill: "var(--surface-muted)" },
};
