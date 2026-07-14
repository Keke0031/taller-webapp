# Talleron — prototipo web (Next.js + Supabase, arquitectura segura)

App de gestión para talleres mecánicos: clientes/vehículos, órdenes de servicio,
inventario con descuento automático, garantías, fotos y recordatorios preventivos
con link directo a WhatsApp.

## Arquitectura (importante)

El navegador **nunca** habla directo con Supabase. Todas las lecturas y
escrituras pasan por rutas API de Next.js (`app/api/**`), que usan la
`service_role key` de Supabase — una llave que solo vive en el servidor y que
siempre puede saltarse las políticas de RLS. Las tablas tienen RLS activado
y sin políticas para `anon`/`authenticated`, así que aunque alguien encuentre
la URL de tu proyecto de Supabase, no puede leer ni escribir nada sin pasar
por tu backend.

```
Navegador → /api/* (Next.js, server) → Supabase (service_role key)
```

## 1. Crear la base de datos

1. Supabase → **SQL Editor** → **New query**.
2. Pega TODO `supabase/schema.sql` y dale **Run**. Crea las tablas, activa RLS
   sin políticas abiertas, y llena datos de ejemplo para probar de inmediato.
3. Ve a **Settings → API** y copia:
   - **Project URL**
   - **service_role key** (la secreta — NO la "anon public")

## 2. Configurar el proyecto localmente

```bash
npm install
cp .env.local.example .env.local
```

Edita `.env.local`:

```
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

```bash
npm run dev
```

Abre http://localhost:3000 — entra con el PIN `1234` o `5678`.

## 3. Desplegar a internet (Vercel, gratis)

1. Sube esta carpeta a un repo de GitHub (o `vercel --prod` desde la CLI).
2. https://vercel.com → **Add New Project** → importa el repo.
3. En **Environment Variables** agrega `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
   (exactamente esos nombres, sin `NEXT_PUBLIC_`).
4. Deploy. En 1-2 minutos tienes una URL pública para probar desde cualquier
   celular o tablet del taller.

## Qué SÍ está resuelto para pruebas internas

- La base de datos ya no está expuesta al navegador (arquitectura server-only).
- Inventario se descuenta de verdad al agregar kits/insumos a una orden.
- Los recordatorios preventivos se calculan del historial real.

## Qué falta antes de usarlo con datos reales de clientes (producción)

- **Autenticación real**: el PIN valida contra la base de datos, pero la
  "sesión" es solo un `localStorage` en el navegador — cualquiera con acceso
  físico al dispositivo desbloqueado sigue teniendo acceso completo. Para
  producción real conviene Supabase Auth (o similar) con expiración de sesión.
- **Multiusuario / multi-taller**: el esquema asume un solo taller. Si algún
  día vendes esto a varios talleres, cada tabla necesita una columna
  `taller_id` y políticas RLS que la filtren.
- **Subida real de fotos**: hoy se pega una URL a mano; falta conectar
  Supabase Storage para subir la foto desde la cámara del celular.
- **WhatsApp automático**: el botón abre un link `wa.me` — requiere un clic.
  Para que salga solo, se necesita la API oficial de WhatsApp Business
  (Cloud API o Twilio) + un cron diario (Vercel Cron / Supabase Edge Functions).
- **Backups**: activa los backups automáticos de Supabase (Settings → Database).
- **Rate limiting / abuso**: las rutas API no tienen límite de intentos en el
  login por PIN; en producción conviene agregarlo.

## Estructura

```
app/            páginas + rutas API (app/api/**)
components/     Sidebar/shell compartido y badge de estado
lib/            supabaseAdmin (server-only) + funciones de dominio
supabase/       esquema SQL + datos de ejemplo
```
