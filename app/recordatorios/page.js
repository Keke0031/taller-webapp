"use client";
import { useEffect, useState } from "react";
import { CalendarClock, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { calcularRecordatorios, mensajeRecordatorio, telefonoWA, estadoRecordatorio, hoy } from "@/lib/domain";

export default function RecordatoriosPage() {
  const [cargando, setCargando] = useState(true);
  const [recordatorios, setRecordatorios] = useState([]);
  const [enviados, setEnviados] = useState({});
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/data");
      const { ordenes, detalles, vehiculos, clientes, kits } = await res.json();
      setRecordatorios(calcularRecordatorios({ ordenes, detalles, vehiculos, clientes, kits }));
      setCargando(false);
    })();
  }, []);

  const visibles = recordatorios.filter((r) => {
    if (filtro === "todos") return true;
    if (filtro === "vencidos") return r.diasRestantes <= 0;
    if (filtro === "proximos") return r.diasRestantes > 0 && r.diasRestantes <= 15;
    return true;
  });

  if (cargando) return <AppShell><div className="loading-box">Calculando recordatorios…</div></AppShell>;

  return (
    <AppShell>
      <div className="view">
        <header className="view-header">
          <div>
            <div className="eyebrow">Retención automática de clientes</div>
            <h1>Recordatorios preventivos</h1>
            <div className="sub-line"><CalendarClock size={14} /> Calculado a partir del último mantenimiento entregado + intervalo del kit</div>
          </div>
          <div className="header-actions">
            {[["todos", "Todos"], ["vencidos", "Vencidos"], ["proximos", "Próximos 15 días"]].map(([k, label]) => (
              <button key={k} className={`chip ${filtro === k ? "chip-active" : ""}`} style={{ "--chip-color": "var(--accent)" }} onClick={() => setFiltro(k)}>{label}</button>
            ))}
          </div>
        </header>

        <div className="panel">
          {visibles.length === 0 && <div className="empty">No hay mantenimientos preventivos en este filtro.</div>}
          <div className="rec-list">
            {visibles.map((r) => {
              const est = estadoRecordatorio(r.diasRestantes);
              const mensaje = mensajeRecordatorio(r);
              const yaEnviado = enviados[r.id];
              const waHref = `https://wa.me/${telefonoWA(r.cliente.telefono)}?text=${encodeURIComponent(mensaje)}`;
              return (
                <div key={r.id} className="rec-row">
                  <span className="badge" style={{ "--badge-color": est.color }}><span className="badge-dot" />{est.label}</span>
                  <div className="rec-info">
                    <div className="rec-cliente"><strong>{r.cliente.nombre}</strong> <span className="muted small">· {r.vehiculo.marca} {r.vehiculo.modelo} <span className="mono">{r.vehiculo.placa}</span></span></div>
                    <div className="muted small">
                      {r.kit.nombre} · último: {r.fechaUltima} · próximo: {r.fechaObjetivo}
                      {" "}({r.diasRestantes <= 0 ? `vencido hace ${Math.abs(r.diasRestantes)} día${Math.abs(r.diasRestantes) === 1 ? "" : "s"}` : `en ${r.diasRestantes} día${r.diasRestantes === 1 ? "" : "s"}`})
                    </div>
                    <div className="rec-preview muted small"><MessageCircle size={12} /> {mensaje}</div>
                  </div>
                  <div className="rec-actions">
                    {yaEnviado && <span className="pill pill-ok small"><CheckCircle2 size={12} /> Enviado {yaEnviado}</span>}
                    <a
                      className="btn-wa"
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setEnviados((prev) => ({ ...prev, [r.id]: hoy() }))}
                    >
                      <Send size={14} /> {yaEnviado ? "Reenviar" : "Enviar por WhatsApp"}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
