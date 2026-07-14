// SOLO SE IMPORTA DESDE RUTAS API (app/api/**/route.js) — nunca desde
// componentes "use client". La service_role key nunca debe llegar al navegador.
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Configúralas en .env.local / variables de entorno de Vercel."
  );
}

export const supabaseAdmin = createClient(url || "", serviceKey || "", {
  auth: { persistSession: false },
});
