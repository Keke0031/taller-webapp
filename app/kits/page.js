"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { money } from "@/lib/domain";

export default function KitsPage() {
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/data");
      const data = await res.json();
      setDatos(data);
      setCargando(false);
    })();
  }, []);

  if (cargando) return <AppShell><div className="loading-box">Cargando kits…</div></AppShell>;

  const { kits, insumos } = datos;

  return (
    <AppShell>
      <div className="view">
        <header className="view-header">
          <div>
            <div className="eyebrow">Catálogo</div>
            <h1>Kits de servicio</h1>
          </div>
        </header>
        <div className="kit-grid">
          {kits.map((k) => (
            <div key={k.id} className="kit-card">
              <div className="kit-header">
                <div className="kit-nombre">{k.nombre}</div>
                <div className="kit-precio">{money(k.precio)}</div>
              </div>
              {k.intervalo_dias && (
                <div className="muted small" style={{ marginBottom: 8 }}>Recordatorio cada {k.intervalo_dias} días / {k.intervalo_km} km</div>
              )}
              <div className="kit-insumos">
                {k.kit_insumos.map((ki) => {
                  const ins = insumos.find((i) => i.id === ki.insumo_id);
                  return <div key={ki.id} className="kit-insumo-row"><span>{ins?.nombre}</span><span className="mono muted">{ki.cantidad} {ins?.unidad}</span></div>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
