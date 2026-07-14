import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const [clientes, vehiculos, insumos, kits, ordenes, detalles, movimientos, cotizaciones] = await Promise.all([
    supabaseAdmin.from("clientes").select("*").order("nombre"),
    supabaseAdmin.from("vehiculos").select("*"),
    supabaseAdmin.from("insumos").select("*").order("nombre"),
    supabaseAdmin.from("kits").select("*, kit_insumos(*)").order("id"),
    supabaseAdmin.from("ordenes_servicio").select("*").order("id", { ascending: false }),
    supabaseAdmin.from("orden_detalle").select("*, garantias(*), fotos(*)").order("id"),
    supabaseAdmin.from("movimientos_inventario").select("*").order("id", { ascending: false }),
    supabaseAdmin.from("cotizaciones").select("*, ordenes_servicio(folio, vehiculo_id)").order("created_at", { ascending: false }),
  ]);

  const resultados = { clientes, vehiculos, insumos, kits, ordenes, detalles, movimientos, cotizaciones };
  const conError = Object.entries(resultados).find(([, r]) => r.error);
  if (conError) {
    return NextResponse.json({ error: `${conError[0]}: ${conError[1].error.message}` }, { status: 500 });
  }

  return NextResponse.json({
    clientes: clientes.data,
    vehiculos: vehiculos.data,
    insumos: insumos.data,
    kits: kits.data,
    ordenes: ordenes.data,
    detalles: detalles.data,
    movimientos: movimientos.data,
    cotizaciones: cotizaciones.data,
  });
}
