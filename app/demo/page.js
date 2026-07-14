"use client";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "talleron_demo_registros";

function formatTime(isoString) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function loadEntries() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function DemoPage() {
  const [nombre, setNombre] = useState("");
  const [entradas, setEntradas] = useState([]);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    setEntradas(loadEntries());
  }, []);

  const total = useMemo(() => entradas.length, [entradas]);

  function registrarIngreso(event) {
    event.preventDefault();
    setError("");
    const nombreTrim = nombre.trim();
    if (!nombreTrim) {
      setError("Ingresa tu nombre para registrar el ingreso.");
      return;
    }

    const nuevaEntrada = {
      nombre: nombreTrim,
      ingresadoAt: new Date().toISOString(),
    };

    const next = [nuevaEntrada, ...entradas].slice(0, 20);
    saveEntries(next);
    setEntradas(next);
    setNombre("");
    setGuardado(true);
    window.setTimeout(() => setGuardado(false), 2500);
  }

  function limpiarRegistros() {
    window.localStorage.removeItem(STORAGE_KEY);
    setEntradas([]);
  }

  return (
    <div className="demo-page" style={{ padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
      <h1>Prueba pública / Demo</h1>
      <p style={{ maxWidth: "42rem", lineHeight: 1.7 }}>
        Esta página es pública y no usa la interfaz protegida de la app. Aquí puedes
        registrar un ingreso de prueba con el nombre de la persona y la hora de acceso.
      </p>

      <section style={{ marginTop: "1.5rem", padding: "1.5rem", borderRadius: "1rem", background: "#f7f7fb" }}>
        <h2>Registro de ingreso</h2>
        <p style={{ marginBottom: "1rem" }}>
          Ingresa tu nombre y presiona el botón para validar un acceso de prueba.
        </p>
        <form onSubmit={registrarIngreso} style={{ display: "grid", gap: "1rem" }}>
          <label style={{ display: "block" }}>
            Nombre completo
            <input
              autoComplete="off"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Ej: Carlos Mendoza"
              style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem", borderRadius: "0.75rem", border: "1px solid #ccc" }}
            />
          </label>
          {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="submit" style={{ padding: "0.9rem 1.2rem", borderRadius: "0.75rem", background: "#2563eb", color: "white", border: "none", cursor: "pointer" }}>
              Registrar ingreso
            </button>
            <button type="button" onClick={limpiarRegistros} style={{ padding: "0.9rem 1.2rem", borderRadius: "0.75rem", background: "#e5e7eb", color: "#111827", border: "none", cursor: "pointer" }}>
              Limpiar registros
            </button>
          </div>
          {guardado && <div style={{ color: "#047857" }}>Ingreso registrado correctamente.</div>}
        </form>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h2>Entradas recientes</h2>
          <span style={{ color: "#4b5563" }}>{total} registro(s)</span>
        </div>
        {entradas.length === 0 ? (
          <div style={{ marginTop: "1rem", padding: "1rem", borderRadius: "0.75rem", background: "#f3f4f6", color: "#374151" }}>
            No hay registros aun. Usa el formulario para crear uno.
          </div>
        ) : (
          <div style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
            {entradas.map((entrada, index) => (
              <div key={entrada.ingresadoAt + index} style={{ padding: "1rem", borderRadius: "0.75rem", background: "white", border: "1px solid #e5e7eb" }}>
                <div style={{ fontWeight: 600 }}>{entrada.nombre}</div>
                <div style={{ color: "#6b7280", marginTop: "0.25rem" }}>Ingresó el {formatTime(entrada.ingresadoAt)}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
