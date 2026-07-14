export const money = (n) => `$${Number(n || 0).toFixed(2)}`;
export const hoy = () => new Date().toISOString().slice(0, 10);

export const ESTADOS = {
  pendiente: { label: "Pendiente", color: "var(--caution)" },
  en_progreso: { label: "En progreso", color: "var(--accent)" },
  entregado: { label: "Entregado", color: "var(--success)" },
};

export function diffDias(fechaISO) {
  const MS_DIA = 1000 * 60 * 60 * 24;
  const hoyD = new Date(hoy() + "T00:00:00");
  const f = new Date(fechaISO + "T00:00:00");
  return Math.round((f - hoyD) / MS_DIA);
}

export function sumarDias(fechaISO, dias) {
  const f = new Date(fechaISO + "T00:00:00");
  f.setDate(f.getDate() + dias);
  return f.toISOString().slice(0, 10);
}

export function telefonoWA(telefono) {
  const digits = (telefono || "").replace(/\D/g, "");
  return digits.length <= 8 ? `507${digits}` : digits; // asume Panamá si es número local
}

export function mensajeRecordatorio({ cliente, vehiculo, kit, fechaObjetivo, diasRestantes }) {
  const primerNombre = cliente.nombre.split(" ")[0];
  const cuando =
    diasRestantes < 0
      ? `venció hace ${Math.abs(diasRestantes)} día${Math.abs(diasRestantes) === 1 ? "" : "s"}`
      : diasRestantes === 0
      ? "es hoy"
      : `es en ${diasRestantes} día${diasRestantes === 1 ? "" : "s"}`;
  return `Hola ${primerNombre}, tu próximo "${kit.nombre}" en tu ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.placa}) ${cuando} (${fechaObjetivo}). Para mantener tu motor al 100% y evitar daños mayores, ¿te reservamos un espacio esta semana? Responde este mensaje para agendar.`;
}

export function estadoRecordatorio(diasRestantes) {
  if (diasRestantes <= 0) return { label: "Vencido", color: "var(--danger)" };
  if (diasRestantes <= 15) return { label: "Próximo", color: "var(--caution)" };
  return { label: "Programado", color: "var(--success)" };
}

// A partir de órdenes "entregado" + sus detalles (kits con intervalo_dias),
// calcula el próximo mantenimiento preventivo por vehículo.
export function calcularRecordatorios({ ordenes, detalles, vehiculos, clientes, kits }) {
  const items = [];
  vehiculos.forEach((v) => {
    const cliente = clientes.find((c) => c.id === v.cliente_id);
    if (!cliente) return;
    const ordenesVehiculo = ordenes.filter((o) => o.vehiculo_id === v.id && o.estado === "entregado");

    const ultimaPorKit = {};
    ordenesVehiculo.forEach((o) => {
      const dets = detalles.filter((d) => d.orden_id === o.id && d.tipo === "kit");
      dets.forEach((d) => {
        const kit = kits.find((k) => k.id === d.kit_id);
        if (!kit || !kit.intervalo_dias) return;
        if (!ultimaPorKit[kit.id] || o.fecha > ultimaPorKit[kit.id]) ultimaPorKit[kit.id] = o.fecha;
      });
    });

    Object.entries(ultimaPorKit).forEach(([kitId, fechaUltima]) => {
      const kit = kits.find((k) => k.id === Number(kitId));
      const fechaObjetivo = sumarDias(fechaUltima, kit.intervalo_dias);
      const diasRestantes = diffDias(fechaObjetivo);
      items.push({ id: `${v.id}-${kit.id}`, vehiculo: v, cliente, kit, fechaUltima, fechaObjetivo, diasRestantes });
    });
  });
  return items.sort((a, b) => a.diasRestantes - b.diasRestantes);
}
