import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const { detalleId, url, descripcion } = await req.json();
  if (!detalleId) return NextResponse.json({ error: "Falta detalleId" }, { status: 400 });

  const { error } = await supabaseAdmin.from("fotos").insert({ orden_detalle_id: detalleId, url, descripcion });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
