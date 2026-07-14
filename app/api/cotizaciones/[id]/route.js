import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ESTADOS_VALIDOS = ["pendiente", "aprobada", "rechazada"];

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const { estado, respondido_en } = body;

  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    return NextResponse.json({ error: "Estado inválido. Usa: pendiente, aprobada o rechazada" }, { status: 400 });
  }

  const updates = {};
  if (estado) updates.estado = estado;
  if (estado && estado !== "pendiente") {
    updates.respondido_en = respondido_en ?? new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from("cotizaciones")
    .update(updates)
    .eq("id", Number(id))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cotizacion: data });
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("cotizaciones")
    .delete()
    .eq("id", Number(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
