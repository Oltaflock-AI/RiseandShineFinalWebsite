export function Kpi({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="kpi">
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        {icon && <span className="kpi-icon">{icon}</span>}
      </div>
      <div className="kpi-val num">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );
}
