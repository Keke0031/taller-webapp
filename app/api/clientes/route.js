import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const body = await req.json();
  const { nombre, telefono, vehiculo } = body || {};
  if (!nombre || !vehiculo?.placa) {
    return NextResponse.json({ error: "Faltan datos del cliente o del vehículo" }, { status: 400 });
  }

  const { data: cliente, error: e1 } = await supabaseAdmin
    .from("clientes")
    .insert({ nombre, telefono })
    .select()
    .single();
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  const { data: veh, error: e2 } = await supabaseAdmin
    .from("vehiculos")
    .insert({
      cliente_id: cliente.id,
      placa: vehiculo.placa,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      anio: vehiculo.anio || null,
      vin: vehiculo.vin,
    })
    .select()
    .single();
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  return NextResponse.json({ cliente, vehiculo: veh });
}
