import { ESTADOS } from "@/lib/domain";

export default function EstadoBadge({ estado }) {
  const e = ESTADOS[estado];
  return (
    <span className="badge" style={{ "--badge-color": e.color }}>
      <span className="badge-dot" />
      {e.label}
    </span>
  );
}
