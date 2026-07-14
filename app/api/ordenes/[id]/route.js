import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const { estado } = await req.json();
  if (!["pendiente", "en_progreso", "entregado"].includes(estado)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from("ordenes_servicio").update({ estado }).eq("id", Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
