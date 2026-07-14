import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function descontarInsumo(insumoId, cantidad, ordenId, usuario) {
  const { data: insumo } = await supabaseAdmin.from("insumos").select("cantidad_actual").eq("id", insumoId).single();
  const nuevaCantidad = (insumo?.cantidad_actual ?? 0) - cantidad;
  await supabaseAdmin.from("insumos").update({ cantidad_actual: nuevaCantidad }).eq("id", insumoId);
  await supabaseAdmin.from("movimientos_inventario").insert({
    insumo_id: insumoId, cantidad: -cantidad, tipo: "salida", orden_id: ordenId, usuario: usuario || "—",
  });
}

export async function POST(req, { params }) {
  const { id } = await params;
  const ordenId = Number(id);
  const { tipo, refId, cantidad, usuario } = await req.json();
  const cant = Number(cantidad) || 1;

  if (tipo === "kit") {
    const { data: kit, error } = await supabaseAdmin.from("kits").select("*, kit_insumos(*)").eq("id", refId).single();
    if (error || !kit) return NextResponse.json({ error: "Kit no encontrado" }, { status: 404 });

    const { error: e1 } = await supabaseAdmin.from("orden_detalle").insert({
      orden_id: ordenId, tipo: "kit", kit_id: kit.id, nombre: kit.nombre, cantidad: cant, precio_unit: kit.precio,
    });
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

    for (const ki of kit.kit_insumos) {
      await descontarInsumo(ki.insumo_id, ki.cantidad * cant, ordenId, usuario);
    }
  } else {
    const { data: ins, error } = await supabaseAdmin.from("insumos").select("*").eq("id", refId).single();
    if (error || !ins) return NextResponse.json({ error: "Insumo no encontrado" }, { status: 404 });

    const precioVenta = ins.costo * 2;
    const { error: e1 } = await supabaseAdmin.from("orden_detalle").insert({
      orden_id: ordenId, tipo: "insumo", insumo_id: ins.id, nombre: ins.nombre, cantidad: cant, precio_unit: precioVenta,
    });
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

    await descontarInsumo(ins.id, cant, ordenId, usuario);
  }

  return NextResponse.json({ ok: true });
}
