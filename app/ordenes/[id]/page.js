"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, X, Users, PhoneCall, ShieldCheck, Camera } from "lucide-react";
import AppShell from "@/components/AppShell";
import { money, ESTADOS } from "@/lib/domain";
import { getStoredSession } from "@/lib/session";

export default function OrdenDetallePage() {
  const { id } = useParams();
  const ordenId = Number(id);

  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState(null);
  const [tipoItem, setTipoItem] = useState("kit");
  const [refId, setRefId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [garantiaFor, setGarantiaFor] = useState(null);
  const [fotoFor, setFotoFor] = useState(null);

  async function cargarTodo() {
    const res = await fetch("/api/data");
    const data = await res.json();
    setDatos(data);
    setCargando(false);
  }

  useEffect(() => { cargarTodo(); }, []);

  function usuarioActual() {
    return getStoredSession()?.nombre || "—";
  }

  async function agregarItem() {
    if (!refId) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/ordenes/${ordenId}/items`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: tipoItem, refId: Number(refId), cantidad: Number(cantidad), usuario: usuarioActual() }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setRefId("");
      setCantidad(1);
      await cargarTodo();
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(estado) {
    await fetch(`/api/ordenes/${ordenId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado }),
    });
    setDatos((prev) => ({ ...prev, ordenes: prev.ordenes.map((o) => (o.id === ordenId ? { ...o, estado } : o)) }));
  }

  async function guardarGarantia(detalleId, dias) {
    await fetch(`/api/ordenes/${ordenId}/garantia`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ detalleId, dias }),
    });
    setGarantiaFor(null);
    cargarTodo();
  }

  async function guardarFoto(detalleId, url, descripcion) {
    await fetch(`/api/ordenes/${ordenId}/foto`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ detalleId, url, descripcion }),
    });
    setFotoFor(null);
    cargarTodo();
  }

  if (cargando) return <AppShell><div className="loading-box">Cargando orden…</div></AppShell>;

  const { ordenes, detalles: todosDetalles, vehiculos, clientes, kits, insumos } = datos;
  const orden = ordenes.find((o) => o.id === ordenId);
  if (!orden) return <AppShell><div className="empty">Esta orden no existe.</div></AppShell>;

  const vehiculo = vehiculos.find((v) => v.id === orden.vehiculo_id);
  const cliente = clientes.find((c) => c.id === vehiculo?.cliente_id);
  const detalle = todosDetalles.filter((d) => d.orden_id === ordenId);
  const total = detalle.reduce((s, d) => s + d.precio_unit * d.cantidad, 0);

  return (
    <AppShell>
      <div className="view">
        <a href="/ordenes" className="link-back">← Todas las órdenes</a>
        <header className="view-header">
          <div>
            <div className="eyebrow mono">{orden.folio}</div>
            <h1>{vehiculo?.marca} {vehiculo?.modelo} <span className="mono muted">· {vehiculo?.placa}</span></h1>
            <div className="sub-line"><Users size={14} /> {cliente?.nombre} <PhoneCall size={13} style={{ marginLeft: 10 }} /> {cliente?.telefono}</div>
          </div>
          <div className="header-actions">
            {Object.keys(ESTADOS).map((k) => (
              <button key={k} className={`chip ${orden.estado === k ? "chip-active" : ""}`} style={{ "--chip-color": ESTADOS[k].color }} onClick={() => cambiarEstado(k)}>
                {ESTADOS[k].label}
              </button>
            ))}
          </div>
        </header>

        <div className="panel">
          <div className="panel-title">Agregar trabajo o repuesto</div>
          <div className="add-item-row">
            <select className="select" value={tipoItem} onChange={(e) => { setTipoItem(e.target.value); setRefId(""); }}>
              <option value="kit">Kit de servicio</option>
              <option value="insumo">Insumo suelto</option>
            </select>
            <select className="select grow" value={refId} onChange={(e) => setRefId(e.target.value)}>
              <option value="">Elegir…</option>
              {(tipoItem === "kit" ? kits : insumos).map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nombre}{tipoItem === "insumo" ? ` (stock: ${x.cantidad_actual} ${x.unidad})` : ` — ${money(x.precio)}`}
                </option>
              ))}
            </select>
            <input className="input qty" type="number" min={1} value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
            <button className="btn-primary" disabled={guardando} onClick={agregarItem}><Plus size={16} /> {guardando ? "Guardando…" : "Agregar"}</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Detalle de la orden</div>
          {detalle.length === 0 && <div className="empty">Aún no hay kits ni insumos agregados.</div>}
          <div className="detalle-list">
            {detalle.map((d) => {
              const garantia = d.garantias?.[0];
              const fotos = d.fotos || [];
              return (
                <div key={d.id} className="detalle-item">
                  <div className="detalle-main">
                    <span className={`tag ${d.tipo === "kit" ? "tag-kit" : "tag-insumo"}`}>{d.tipo === "kit" ? "Kit" : "Insumo"}</span>
                    <div>
                      <div className="detalle-nombre">{d.nombre}</div>
                      <div className="detalle-meta">Cant. {d.cantidad} · {money(d.precio_unit)} c/u</div>
                    </div>
                    <div className="detalle-precio">{money(d.precio_unit * d.cantidad)}</div>
                  </div>

                  <div className="detalle-extras">
                    {garantia ? (
                      <span className="pill pill-ok"><ShieldCheck size={13} /> Garantía hasta {garantia.fecha_fin}</span>
                    ) : garantiaFor === d.id ? (
                      <GarantiaForm onGuardar={(dias) => guardarGarantia(d.id, dias)} onCancelar={() => setGarantiaFor(null)} />
                    ) : (
                      <button className="pill-btn" onClick={() => setGarantiaFor(d.id)}><ShieldCheck size={13} /> Añadir garantía</button>
                    )}

                    {fotoFor === d.id ? (
                      <FotoForm onGuardar={(url, desc) => guardarFoto(d.id, url, desc)} onCancelar={() => setFotoFor(null)} />
                    ) : (
                      <button className="pill-btn" onClick={() => setFotoFor(d.id)}><Camera size={13} /> Añadir foto ({fotos.length})</button>
                    )}
                  </div>

                  {fotos.length > 0 && (
                    <div className="foto-strip">
                      {fotos.map((f) => (
                        <div key={f.id} className="foto-thumb">
                          {f.url ? <img src={f.url} alt={f.descripcion} /> : <div className="foto-placeholder"><Camera size={14} /></div>}
                          <span>{f.descripcion || "Sin descripción"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {detalle.length > 0 && (
            <div className="orden-total-row">
              <span>Total de la orden</span>
              <span className="orden-total">{money(total)}</span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function GarantiaForm({ onGuardar, onCancelar }) {
  const [dias, setDias] = useState(90);
  return (
    <div className="inline-form">
      <input className="input qty" type="number" value={dias} onChange={(e) => setDias(e.target.value)} />
      <span className="muted small">días</span>
      <button className="btn-ghost small" onClick={() => onGuardar(dias)}>Guardar</button>
      <button className="btn-ghost small" onClick={onCancelar}><X size={13} /></button>
    </div>
  );
}

function FotoForm({ onGuardar, onCancelar }) {
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <div className="inline-form">
      <input className="input" placeholder="URL de la foto (opcional)" value={url} onChange={(e) => setUrl(e.target.value)} />
      <input className="input" placeholder="Descripción, ej. 'balata desgastada'" value={desc} onChange={(e) => setDesc(e.target.value)} />
      <button className="btn-ghost small" onClick={() => onGuardar(url, desc)}>Guardar</button>
      <button className="btn-ghost small" onClick={onCancelar}><X size={13} /></button>
    </div>
  );
}
