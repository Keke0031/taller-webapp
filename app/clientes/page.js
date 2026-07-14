"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, PhoneCall, Car, ChevronRight } from "lucide-react";
import AppShell from "@/components/AppShell";

export default function ClientesPage() {
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [expandido, setExpandido] = useState(null);
  const [form, setForm] = useState({ nombre: "", telefono: "", placa: "", marca: "", modelo: "", anio: "", vin: "" });
  const router = useRouter();

  async function cargarTodo() {
    const res = await fetch("/api/data");
    const data = await res.json();
    setDatos(data);
    setCargando(false);
  }

  useEffect(() => { cargarTodo(); }, []);

  async function guardar() {
    if (!form.nombre || !form.placa) return;
    setGuardando(true);
    const res = await fetch("/api/clientes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre, telefono: form.telefono,
        vehiculo: { placa: form.placa, marca: form.marca, modelo: form.modelo, anio: Number(form.anio) || null, vin: form.vin },
      }),
    });
    const data = await res.json();
    setGuardando(false);
    if (!res.ok) { alert(data.error); return; }
    setForm({ nombre: "", telefono: "", placa: "", marca: "", modelo: "", anio: "", vin: "" });
    setMostrarForm(false);
    cargarTodo();
  }

  async function nuevaOrdenPara(vehiculoId) {
    const res = await fetch("/api/ordenes", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vehiculo_id: vehiculoId }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    router.push(`/ordenes/${data.orden.id}`);
  }

  if (cargando) return <AppShell><div className="loading-box">Cargando clientes…</div></AppShell>;

  const { clientes, vehiculos, ordenes } = datos;

  return (
    <AppShell>
      <div className="view">
        <header className="view-header">
          <div>
            <div className="eyebrow">Base de clientes</div>
            <h1>Clientes y vehículos</h1>
          </div>
          <button className="btn-primary" onClick={() => setMostrarForm((s) => !s)}>
            <Plus size={16} /> Cliente nuevo
          </button>
        </header>

        {mostrarForm && (
          <div className="panel">
            <div className="panel-title">Registrar cliente y vehículo</div>
            <div className="form-grid">
              <input className="input" placeholder="Nombre del cliente" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              <input className="input" placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              <input className="input mono" placeholder="Placa" value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })} />
              <input className="input" placeholder="Marca" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
              <input className="input" placeholder="Modelo" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
              <input className="input" placeholder="Año" value={form.anio} onChange={(e) => setForm({ ...form, anio: e.target.value })} />
              <input className="input mono" placeholder="VIN (opcional)" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
            </div>
            <button className="btn-primary" disabled={guardando} onClick={guardar}>{guardando ? "Guardando…" : "Guardar cliente"}</button>
          </div>
        )}

        <div className="cliente-list">
          {clientes.map((c) => {
            const susVehiculos = vehiculos.filter((v) => v.cliente_id === c.id);
            const abierto = expandido === c.id;
            return (
              <div key={c.id} className="cliente-card">
                <button className="cliente-header" onClick={() => setExpandido(abierto ? null : c.id)}>
                  <div className="avatar small">{c.nombre.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
                  <div className="cliente-meta">
                    <div className="cliente-nombre">{c.nombre}</div>
                    <div className="muted small"><PhoneCall size={12} /> {c.telefono} · {susVehiculos.length} vehículo{susVehiculos.length !== 1 ? "s" : ""}</div>
                  </div>
                  <ChevronRight size={16} style={{ transform: abierto ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                </button>
                {abierto && (
                  <div className="vehiculo-list">
                    {susVehiculos.map((v) => {
                      const historial = ordenes.filter((o) => o.vehiculo_id === v.id);
                      return (
                        <div key={v.id} className="vehiculo-row">
                          <Car size={16} className="muted" />
                          <div className="vehiculo-info">
                            <div><strong>{v.marca} {v.modelo}</strong> <span className="mono muted">{v.placa}</span> · {v.anio}</div>
                            <div className="muted small mono">VIN {v.vin}</div>
                            <div className="muted small">{historial.length} visita{historial.length !== 1 ? "s" : ""} en el taller</div>
                          </div>
                          <button className="btn-ghost small" onClick={() => nuevaOrdenPara(v.id)}>Nueva orden</button>
                        </div>
                      );
                    })}
                    {susVehiculos.length === 0 && <div className="empty">Este cliente no tiene vehículos registrados.</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
