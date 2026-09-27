// Shared recharts styling, driven by the theme CSS variables so charts match light and dark mode
export const INCOME_COLOR = "hsl(156, 100%, 40%)"
export const EXPENSE_COLOR = "hsl(0, 84%, 60%)"

export const chartGridProps = {
  strokeDasharray: "3 3",
  stroke: "hsl(var(--border))",
  vertical: false,
}

export const chartAxisProps = {
  stroke: "hsl(var(--muted-foreground))",
  tickLine: false,
  axisLine: false,
  style: { fontSize: "12px" },
}

export const chartTooltipProps = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.5rem",
    color: "hsl(var(--card-foreground))",
    fontSize: "12px",
  },
  labelStyle: { color: "hsl(var(--muted-foreground))", marginBottom: 4 },
  cursor: { fill: "hsl(var(--muted) / 0.3)" },
}
