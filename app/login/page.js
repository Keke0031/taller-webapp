"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, AlertTriangle, Delete } from "lucide-react";
import { saveSession } from "@/lib/session";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  async function intentar(pinCompleto) {
    setCargando(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinCompleto }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo iniciar sesión");
        setPin("");
        return;
      }
      saveSession(data.usuario);
      router.replace("/dashboard");
    } catch {
      setError("No se pudo conectar con el servidor.");
      setPin("");
    } finally {
      setCargando(false);
    }
  }

  function press(d) {
    if (pin.length >= 4 || cargando) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4) intentar(next);
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <Wrench size={26} strokeWidth={2.5} />
          <span>TALLERON</span>
        </div>
        <p className="login-sub">Ingresa tu PIN para entrar al turno</p>
        <div className="pin-dots">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`pin-dot ${i < pin.length ? "filled" : ""} ${error ? "error" : ""}`} />
          ))}
        </div>
        {error && (
          <div className="pin-error">
            <AlertTriangle size={14} /> {error}
          </div>
        )}
        <div className="pin-pad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button key={d} className="pin-key" onClick={() => press(d)} disabled={cargando}>{d}</button>
          ))}
          <button className="pin-key ghost" onClick={() => setPin("")} disabled={cargando}>C</button>
          <button className="pin-key" onClick={() => press("0")} disabled={cargando}>0</button>
          <button className="pin-key ghost" onClick={() => setPin(pin.slice(0, -1))} disabled={cargando}><Delete size={18} /></button>
        </div>
        <div className="login-hint">Demo: 1234 (Carlos, mecánico) · 5678 (Ana, recepción)</div>
      </div>
    </div>
  );
}
