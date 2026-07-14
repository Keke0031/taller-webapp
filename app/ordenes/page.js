"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Users } from "lucide-react";
import AppShell from "@/components/AppShell";
import EstadoBadge from "@/components/EstadoBadge";
import { money } from "@/lib/domain";

export default function OrdenesPage() {
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState(null);
  const [buscar, setBuscar] = useState("");
  const [vehiculoNuevo, setVehiculoNuevo] = useState("");
  const [creando, setCreando] = useState(false);
  const router = useRouter();

  async function cargarTodo() {
    const res = await fetch("/api/data");
    const data = await res.json();
    setDatos(data);
    setCargando(false);
  }

  useEffect(() => { cargarTodo(); }, []);

  if (cargando) return <AppShell><div className="loading-box">Cargando órdenes…</div></AppShell>;

  const { ordenes, detalles, vehiculos, clientes } = datos;
  const totalOrden = (ordenId) => detalles.filter((d) => d.orden_id === ordenId).reduce((s, d) => s + d.precio_unit * d.cantidad, 0);
  const clienteDe = (vehiculoId) => {
    const v = vehiculos.find((veh) => veh.id === vehiculoId);
    return v ? clientes.find((c) => c.id === v.cliente_id) : null;
  };

  const filtradas = ordenes.filter((o) => {
    const v = vehiculos.find((veh) => veh.id === o.vehiculo_id);
    const c = clienteDe(o.vehiculo_id);
    const q = buscar.toLowerCase();
    return !q || o.folio.toLowerCase().includes(q) || v?.placa.toLowerCase().includes(q) || c?.nombre.toLowerCase().includes(q);
  });

  async function crearOrden() {
    if (!vehiculoNuevo) return;
    setCreando(true);
    const res = await fetch("/api/ordenes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehiculo_id: Number(vehiculoNuevo) }),
    });
    const data = await res.json();
    setCreando(false);
    if (!res.ok) { alert("No se pudo crear la orden: " + data.error); return; }
    router.push(`/ordenes/${data.orden.id}`);
  }

  return (
    <AppShell>
      <div className="view">
        <header className="view-header">
          <div>
            <div className="eyebrow">Taller</div>
            <h1>Órdenes de servicio</h1>
          </div>
          <div className="header-actions">
            <select className="select" value={vehiculoNuevo} onChange={(e) => setVehiculoNuevo(e.target.value)}>
              <option value="">Elegir vehículo…</option>
              {vehiculos.map((v) => {
                const c = clientes.find((c) => c.id === v.cliente_id);
                return <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo} ({c?.nombre})</option>;
              })}
            </select>
            <button className="btn-primary" disabled={!vehiculoNuevo || creando} onClick={crearOrden}>
              <Plus size={16} /> {creando ? "Creando…" : "Nueva orden"}
            </button>
          </div>
        </header>

        <div className="search-bar">
          <Search size={16} />
          <input placeholder="Buscar por folio, placa o cliente…" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>

        <div className="ticket-grid">
          {filtradas.map((o) => {
            const v = vehiculos.find((veh) => veh.id === o.vehiculo_id);
            const c = clienteDe(o.vehiculo_id);
            const estadoColor = o.estado === "entregado" ? "var(--success)" : o.estado === "en_progreso" ? "var(--accent)" : "var(--caution)";
            return (
              <a key={o.id} href={`/ordenes/${o.id}`} className="ticket" style={{ "--stripe-color": estadoColor }}>
                <span className="ticket-hole" />
                <div className="ticket-folio">{o.folio}</div>
                <div className="ticket-vehiculo">{v?.marca} {v?.modelo} · <span className="mono">{v?.placa}</span></div>
                <div className="ticket-cliente"><Users size={12} /> {c?.nombre}</div>
                <div className="ticket-footer">
                  <EstadoBadge estado={o.estado} />
                  <span className="ticket-total">{money(totalOrden(o.id))}</span>
                </div>
              </a>
            );
          })}
          {filtradas.length === 0 && <div className="empty">No hay órdenes que coincidan con la búsqueda.</div>}
        </div>
      </div>
    </AppShell>
  );
}
