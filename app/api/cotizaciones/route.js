import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("cotizaciones")
    .select("*, ordenes_servicio(folio, vehiculo_id)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cotizaciones: data });
}

export async function POST(req) {
  const body = await req.json();
  const { orden_id, items, total } = body || {};

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Se requiere al menos un ítem" }, { status: 400 });
  }

  const totalCalculado = total ?? items.reduce((s, i) => s + (i.precio_unit ?? 0) * (i.cantidad ?? 1), 0);

  const { data, error } = await supabaseAdmin
    .from("cotizaciones")
    .insert({ orden_id: orden_id ?? null, items, total: totalCalculado, estado: "pendiente" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cotizacion: data });
}
