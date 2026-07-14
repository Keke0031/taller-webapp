"use client";
import { useEffect, useState } from "react";
import { Plus, FileText, CheckCircle2, XCircle, Clock, ChevronRight, X } from "lucide-react";
import AppShell from "@/components/AppShell";
import { money } from "@/lib/domain";

const ESTADO_CONFIG = {
  pendiente: { label: "Pendiente", color: "var(--caution)", icon: Clock },
  aprobada:  { label: "Aprobada",  color: "var(--success)", icon: CheckCircle2 },
  rechazada: { label: "Rechazada", color: "var(--danger)",  icon: XCircle },
};

export default function CotizacionesPage() {
  const [cargando, setCargando] = useState(true);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [expandido, setExpandido] = useState(null);

  // Formulario nueva cotización
  const [form, setForm] = useState({ orden_id: "", items: [{ descripcion: "", cantidad: 1, precio_unit: 0 }] });

  async function cargarTodo() {
    const res = await fetch("/api/data");
    const data = await res.json();
    setCotizaciones(data.cotizaciones ?? []);
    setOrdenes(data.ordenes ?? []);
    setVehiculos(data.vehiculos ?? []);
    setClientes(data.clientes ?? []);
    setCargando(false);
  }

  useEffect(() => { cargarTodo(); }, []);

  function clienteDe(ordenId) {
    const orden = ordenes.find((o) => o.id === ordenId);
    if (!orden) return null;
    const v = vehiculos.find((veh) => veh.id === orden.vehiculo_id);
    return v ? clientes.find((c) => c.id === v.cliente_id) : null;
  }

  function vehiculoDe(ordenId) {
    const orden = ordenes.find((o) => o.id === ordenId);
    return orden ? vehiculos.find((v) => v.id === orden.vehiculo_id) : null;
  }

  async function cambiarEstado(cotizacionId, estado) {
    await fetch(`/api/cotizaciones/${cotizacionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setCotizaciones((prev) =>
      prev.map((c) => (c.id === cotizacionId ? { ...c, estado } : c))
    );
  }

  function agregarItem() {
    setForm((f) => ({ ...f, items: [...f.items, { descripcion: "", cantidad: 1, precio_unit: 0 }] }));
  }

  function quitarItem(idx) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  function actualizarItem(idx, campo, valor) {
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [campo]: valor };
      return { ...f, items };
    });
  }

  const totalForm = form.items.reduce((s, i) => s + (Number(i.precio_unit) || 0) * (Number(i.cantidad) || 1), 0);

  async function guardar() {
    if (form.items.some((i) => !i.descripcion)) {
      alert("Todos los ítems deben tener descripción");
      return;
    }
    setGuardando(true);
    const res = await fetch("/api/cotizaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orden_id: form.orden_id ? Number(form.orden_id) : null,
        items: form.items.map((i) => ({
          descripcion: i.descripcion,
          cantidad: Number(i.cantidad) || 1,
          precio_unit: Number(i.precio_unit) || 0,
        })),
        total: totalForm,
      }),
    });
    const data = await res.json();
    setGuardando(false);
    if (!res.ok) { alert("Error: " + data.error); return; }
    setForm({ orden_id: "", items: [{ descripcion: "", cantidad: 1, precio_unit: 0 }] });
    setMostrarForm(false);
    cargarTodo();
  }

  const visibles = cotizaciones.filter((c) => filtro === "todos" || c.estado === filtro);

  if (cargando) return <AppShell><div className="loading-box">Cargando cotizaciones…</div></AppShell>;

  return (
    <AppShell>
      <div className="view">
        <header className="view-header">
          <div>
            <div className="eyebrow">Presupuestos</div>
            <h1>Cotizaciones</h1>
          </div>
          <div className="header-actions">
            {[["todos", "Todas"], ["pendiente", "Pendientes"], ["aprobada", "Aprobadas"], ["rechazada", "Rechazadas"]].map(([k, label]) => (
              <button
                key={k}
                className={`chip ${filtro === k ? "chip-active" : ""}`}
                style={{ "--chip-color": ESTADO_CONFIG[k]?.color ?? "var(--accent)" }}
                onClick={() => setFiltro(k)}
              >
                {label}
              </button>
            ))}
            <button className="btn-primary" onClick={() => setMostrarForm((s) => !s)}>
              <Plus size={16} /> Nueva cotización
            </button>
          </div>
        </header>

        {mostrarForm && (
          <div className="panel">
            <div className="panel-title">Nueva cotización</div>

            <div style={{ marginBottom: 12 }}>
              <label className="muted small" style={{ display: "block", marginBottom: 4 }}>Orden de servicio (opcional)</label>
              <select className="select" value={form.orden_id} onChange={(e) => setForm({ ...form, orden_id: e.target.value })} style={{ minWidth: 280 }}>
                <option value="">Sin orden vinculada</option>
                {ordenes.map((o) => {
                  const v = vehiculoDe(o.id);
                  const c = clienteDe(o.id);
                  return <option key={o.id} value={o.id}>{o.folio} — {v?.placa} ({c?.nombre})</option>;
                })}
              </select>
            </div>

            <div className="panel-title" style={{ marginTop: 14 }}>Ítems</div>
            {form.items.map((item, idx) => (
              <div key={idx} className="add-item-row" style={{ marginBottom: 8 }}>
                <input
                  className="input grow"
                  placeholder="Descripción del servicio o repuesto"
                  value={item.descripcion}
                  onChange={(e) => actualizarItem(idx, "descripcion", e.target.value)}
                  style={{ flex: 2, minWidth: 200 }}
                />
                <input
                  className="input qty"
                  type="number" min={1} placeholder="Cant."
                  value={item.cantidad}
                  onChange={(e) => actualizarItem(idx, "cantidad", e.target.value)}
                />
                <input
                  className="input qty"
                  type="number" min={0} placeholder="Precio"
                  value={item.precio_unit}
                  onChange={(e) => actualizarItem(idx, "precio_unit", e.target.value)}
                  style={{ width: 90 }}
                />
                <span className="mono muted" style={{ fontSize: 12, minWidth: 60 }}>
                  {money((Number(item.precio_unit) || 0) * (Number(item.cantidad) || 1))}
                </span>
                {form.items.length > 1 && (
                  <button className="icon-btn" onClick={() => quitarItem(idx)}><X size={14} /></button>
                )}
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <button className="btn-ghost small" onClick={agregarItem}><Plus size={14} /> Añadir ítem</button>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span className="mono" style={{ fontWeight: 700 }}>Total: {money(totalForm)}</span>
                <button className="btn-primary" disabled={guardando} onClick={guardar}>
                  {guardando ? "Guardando…" : "Guardar cotización"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="panel">
          {visibles.length === 0 && <div className="empty">No hay cotizaciones en este filtro.</div>}
          <div className="detalle-list">
            {visibles.map((cot) => {
              const cfg = ESTADO_CONFIG[cot.estado] ?? ESTADO_CONFIG.pendiente;
              const IconEstado = cfg.icon;
              const cliente = clienteDe(cot.orden_id);
              const vehiculo = vehiculoDe(cot.orden_id);
              const orden = ordenes.find((o) => o.id === cot.orden_id);
              const abierto = expandido === cot.id;
              const items = Array.isArray(cot.items) ? cot.items : [];

              return (
                <div key={cot.id} className="detalle-item">
                  <div className="detalle-main">
                    <span className="badge" style={{ "--badge-color": cfg.color }}>
                      <IconEstado size={12} /> {cfg.label}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div className="detalle-nombre">
                        {orden ? (
                          <><span className="mono" style={{ color: "var(--accent)" }}>{orden.folio}</span> · {vehiculo?.marca} {vehiculo?.modelo} <span className="mono muted">{vehiculo?.placa}</span></>
                        ) : (
                          <span className="muted">Sin orden vinculada</span>
                        )}
                      </div>
                      {cliente && <div className="detalle-meta">{cliente.nombre}</div>}
                      <div className="detalle-meta">
                        {new Date(cot.created_at).toLocaleDateString("es-PA", { day: "2-digit", month: "short", year: "numeric" })}
                        {" · "}{items.length} ítem{items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="detalle-precio">{money(cot.total)}</div>
                    <button
                      className="icon-btn"
                      onClick={() => setExpandido(abierto ? null : cot.id)}
                      title="Ver ítems"
                    >
                      <ChevronRight size={16} style={{ transform: abierto ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                    </button>
                  </div>

                  {abierto && (
                    <div style={{ marginTop: 12 }}>
                      <table className="table">
                        <thead>
                          <tr><th>Descripción</th><th>Cant.</th><th>Precio unit.</th><th>Subtotal</th></tr>
                        </thead>
                        <tbody>
                          {items.map((it, i) => (
                            <tr key={i}>
                              <td>{it.descripcion}</td>
                              <td>{it.cantidad}</td>
                              <td className="mono">{money(it.precio_unit)}</td>
                              <td className="mono">{money((it.precio_unit ?? 0) * (it.cantidad ?? 1))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {cot.estado === "pendiente" && (
                        <div className="detalle-extras" style={{ marginTop: 10 }}>
                          <button className="btn-primary" style={{ background: "var(--success)", color: "#0e1a12" }} onClick={() => cambiarEstado(cot.id, "aprobada")}>
                            <CheckCircle2 size={14} /> Aprobar
                          </button>
                          <button className="btn-ghost small" style={{ borderColor: "var(--danger)", color: "var(--danger)" }} onClick={() => cambiarEstado(cot.id, "rechazada")}>
                            <XCircle size={14} /> Rechazar
                          </button>
                        </div>
                      )}
                      {cot.estado !== "pendiente" && (
                        <div className="detalle-extras" style={{ marginTop: 10 }}>
                          <button className="btn-ghost small" onClick={() => cambiarEstado(cot.id, "pendiente")}>
                            Volver a pendiente
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
