// SOLO SE IMPORTA DESDE RUTAS API (app/api/**/route.js) — nunca desde
// componentes "use client". La service_role key nunca debe llegar al navegador.
import { createClient } from "@supabase/supabase-js";

const missingConfigMessage =
  "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Configúralas en .env.local / variables de entorno de Vercel.";

let cachedClient = null;

function getSupabaseAdminClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn(missingConfigMessage);
    return null;
  }

  cachedClient = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  return cachedClient;
}

export const supabaseAdmin = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getSupabaseAdminClient();
      if (!client) {
        throw new Error(missingConfigMessage);
      }

      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);
