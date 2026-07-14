"use client";
import { useEffect, useState } from "react";
import { ClipboardList, Users, Car, Gauge, AlertTriangle, Bell, ChevronRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import EstadoBadge from "@/components/EstadoBadge";
import { money, calcularRecordatorios } from "@/lib/domain";

const STOCK_BAJO_UMBRAL = 10;

export default function DashboardPage() {
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/data");
        const data = await res.json();
        if (!res.ok) { setErrorMsg(data.error || "Error al cargar datos"); return; }
        setDatos(data);
      } catch {
        setErrorMsg("No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <AppShell><div className="loading-box">Cargando tablero…</div></AppShell>;
  if (errorMsg) return <AppShell><div className="empty">{errorMsg}</div></AppShell>;

  const { ordenes, detalles, vehiculos, clientes, insumos, kits } = datos;
  const totalOrden = (ordenId) => detalles.filter((d) => d.orden_id === ordenId).reduce((s, d) => s + d.precio_unit * d.cantidad, 0);
  const activas = ordenes.filter((o) => o.estado !== "entregado");
  const facturado = ordenes.reduce((s, o) => s + totalOrden(o.id), 0);
  const insumosBajos = insumos.filter((i) => i.cantidad_actual < STOCK_BAJO_UMBRAL);
  const recordatorios = calcularRecordatorios({ ordenes, detalles, vehiculos, clientes, kits });
  const vencidos = recordatorios.filter((r) => r.diasRestantes <= 0);
  const proximos = recordatorios.filter((r) => r.diasRestantes > 0 && r.diasRestantes <= 15);

  return (
    <AppShell>
      <div className="view">
        <header className="view-header">
          <div>
            <div className="eyebrow">Turno de hoy</div>
            <h1>Tablero</h1>
          </div>
        </header>

        <div className="stat-row">
          <StatCard icon={ClipboardList} label="Órdenes activas" value={activas.length} accent="var(--accent)" />
          <StatCard icon={Users} label="Clientes" value={clientes.length} accent="var(--text)" />
          <StatCard icon={Car} label="Vehículos registrados" value={vehiculos.length} accent="var(--text)" />
          <StatCard icon={Gauge} label="Facturado (histórico)" value={money(facturado)} accent="var(--success)" />
        </div>

        {(vencidos.length > 0 || proximos.length > 0) && (
          <a href="/recordatorios" className="alert-banner alert-clickable" style={{ display: "flex" }}>
            <Bell size={18} />
            <div>
              <strong>{vencidos.length} mantenimiento{vencidos.length !== 1 ? "s" : ""} vencido{vencidos.length !== 1 ? "s" : ""}</strong>
              {proximos.length > 0 && <> · {proximos.length} próximo{proximos.length !== 1 ? "s" : ""} en 15 días</>}
              {" — "}toca para ver a quién contactar
            </div>
            <ChevronRight size={16} style={{ marginLeft: "auto" }} />
          </a>
        )}

        {insumosBajos.length > 0 && (
          <div className="alert-banner">
            <AlertTriangle size={18} />
            <div>
              <strong>{insumosBajos.length} insumo{insumosBajos.length > 1 ? "s" : ""} con stock bajo:</strong>{" "}
              {insumosBajos.map((i) => i.nombre).join(", ")}
            </div>
          </div>
        )}

        <div className="panel">
          <div className="panel-title">Órdenes recientes</div>
          <div className="order-list">
            {ordenes.slice(0, 8).map((o) => {
              const v = vehiculos.find((veh) => veh.id === o.vehiculo_id);
              const c = clientes.find((cl) => cl.id === v?.cliente_id);
              return (
                <a key={o.id} href={`/ordenes/${o.id}`} className="order-row">
                  <span className="order-folio">{o.folio}</span>
                  <span>{c?.nombre}</span>
                  <span className="mono">{v?.placa}</span>
                  <EstadoBadge estado={o.estado} />
                  <span className="order-total">{money(totalOrden(o.id))}</span>
                  <ChevronRight size={16} />
                </a>
              );
            })}
            {ordenes.length === 0 && <div className="empty">Aún no hay órdenes registradas.</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="stat-card">
      <Icon size={18} color={accent} />
      <div className="stat-value" style={{ color: accent }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
