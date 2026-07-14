import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const { detalleId, dias } = await req.json();
  if (!detalleId || !dias) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

  const fin = new Date();
  fin.setDate(fin.getDate() + Number(dias));
  const { error } = await supabaseAdmin.from("garantias").insert({
    orden_detalle_id: detalleId, dias: Number(dias), fecha_fin: fin.toISOString().slice(0, 10),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
