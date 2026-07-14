import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const { vehiculo_id } = await req.json();
  if (!vehiculo_id) return NextResponse.json({ error: "vehiculo_id requerido" }, { status: 400 });

  const folio = `OS-${1000 + Math.floor(Math.random() * 9000)}`;
  const { data, error } = await supabaseAdmin
    .from("ordenes_servicio")
    .insert({ folio, vehiculo_id, estado: "pendiente" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orden: data });
}
