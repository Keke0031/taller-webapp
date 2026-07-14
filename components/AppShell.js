"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Wrench, LayoutDashboard, ClipboardList, Users, Package, LogOut, Bell } from "lucide-react";
import { clearSession, getStoredSession } from "@/lib/session";

const NAV = [
  { href: "/dashboard", label: "Tablero", icon: LayoutDashboard },
  { href: "/ordenes", label: "Órdenes", icon: ClipboardList },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/kits", label: "Kits", icon: Wrench },
  { href: "/recordatorios", label: "Recordatorios", icon: Bell },
];

// Envuelve cada página protegida: exige un usuario en sesión (guardado en
// localStorage tras el login por PIN) y dibuja la barra lateral.
export default function AppShell({ children }) {
  const [usuario, setUsuario] = useState(undefined); // undefined = cargando
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const usuarioGuardado = getStoredSession();
    if (!usuarioGuardado) {
      clearSession();
      router.replace("/login");
      return;
    }
    setUsuario(usuarioGuardado);
  }, [router]);

  function cerrarSesion() {
    clearSession();
    router.replace("/login");
  }

  if (usuario === undefined) return <div className="loading-box">Cargando…</div>;
  if (!usuario) return null;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Wrench size={20} strokeWidth={2.5} />
          <span>TALLERON</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((it) => (
            <a key={it.href} href={it.href} className={`nav-item ${pathname?.startsWith(it.href) ? "active" : ""}`}>
              <it.icon size={18} />
              <span>{it.label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{usuario.nombre.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
          <div className="user-meta">
            <div className="user-name">{usuario.nombre}</div>
            <div className="user-rol">{usuario.rol}</div>
          </div>
          <button className="icon-btn" onClick={cerrarSesion} title="Cerrar turno"><LogOut size={16} /></button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
