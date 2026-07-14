import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const { pin } = await req.json();
  if (!pin) return NextResponse.json({ error: "PIN requerido" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .select("id, nombre, rol, pin")
    .eq("pin", pin)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });

  const { pin: _omit, ...usuario } = data;
  return NextResponse.json({ usuario });
}
