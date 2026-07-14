"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, PackageMinus } from "lucide-react";
import AppShell from "@/components/AppShell";
import { money } from "@/lib/domain";

const STOCK_BAJO_UMBRAL = 10;

export default function InventarioPage() {
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

  if (cargando) return <AppShell><div className="loading-box">Cargando inventario…</div></AppShell>;

  const { insumos, movimientos, ordenes } = datos;

  return (
    <AppShell>
      <div className="view">
        <header className="view-header">
          <div>
            <div className="eyebrow">Bodega</div>
            <h1>Inventario</h1>
          </div>
        </header>

        <div className="panel">
          <div className="panel-title">Insumos</div>
          <table className="table">
            <thead><tr><th>Insumo</th><th>Stock</th><th>Costo</th><th></th></tr></thead>
            <tbody>
              {insumos.map((i) => {
                const bajo = i.cantidad_actual < STOCK_BAJO_UMBRAL;
                return (
                  <tr key={i.id}>
                    <td>{i.nombre}</td>
                    <td className={bajo ? "danger-text" : ""}>{i.cantidad_actual} {i.unidad}</td>
                    <td className="mono">{money(i.costo)}</td>
                    <td>{bajo && <span className="pill pill-danger"><AlertTriangle size={12} /> Stock bajo</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-title">Bitácora de movimientos <span className="muted small">(inmutable — nunca se edita, solo se agrega)</span></div>
          {movimientos.length === 0 && <div className="empty">Aún no hay movimientos. Se generan al agregar kits/insumos a una orden.</div>}
          <div className="mov-list">
            {movimientos.map((m) => {
              const ins = insumos.find((i) => i.id === m.insumo_id);
              const ord = ordenes.find((o) => o.id === m.orden_id);
              return (
                <div key={m.id} className="mov-row">
                  <PackageMinus size={14} className="danger-text" />
                  <span>{ins?.nombre}</span>
                  <span className="mono danger-text">{m.cantidad}</span>
                  <span className="muted small">→ {ord?.folio}</span>
                  <span className="muted small">{m.fecha}</span>
                  <span className="muted small">{m.usuario}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
