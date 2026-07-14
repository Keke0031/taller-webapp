# Talleron — Hoja de referencia

Guarda este documento en un lugar seguro (no lo compartas públicamente —
tiene datos de acceso a tu sistema).

---

## URLs

| Entorno | Dirección | Disponibilidad |
|---|---|---|
| ✅ Producción (la del cliente) | https://taller-webapp-three.vercel.app | Siempre activa |
| 🧪 Prueba | https://taller-webapp-prueba.vercel.app | Siempre activa |
| 🌐 Demo pública | https://taller-webapp-prueba.vercel.app/demo | Siempre activa |
| 💻 Local | http://localhost:3000 | Solo mientras corres `npm run dev` |

> Nota: la página de demo es pública y no requiere login. Solo abre `/demo` para validar el acceso.

---

## PINs de acceso a la app (tabla `usuarios`)

| Usuario | Rol | PIN |
|---|---|---|
| Carlos Mendoza | Mecánico jefe | 1234 |
| Ana Torres | Recepción | 5678 |

⚠️ Antes de que tu cliente empiece a usar producción en serio, cambia estos
PINs por unos reales (Supabase → proyecto de producción → Table Editor →
tabla `usuarios` → edita el campo `pin`).

---

## Proyectos de Supabase

### Producción
- Dashboard: https://supabase.com/dashboard/project/pyijhhxdkykixyctlryj
- Project URL: `https://pyijhhxdkykixyctlryj.supabase.co`
- Service role key: *(sácala de Settings → API Keys → Secret keys — no la
  guardes en texto plano en ningún lado que no sea tu `.env.local` o las
  variables de entorno de Vercel)*

### Prueba Taller
- Project URL: `https://rvbprxfacfkwiqrocsrp.supabase.co`
- Service role key: *(igual, sácala de su propio Settings → API Keys)*

---

## Comandos que vas a usar seguido

Todos se corren desde la Terminal, **dentro de la carpeta del proyecto**:
```bash
cd taller-webapp
```

### Prender el proyecto en tu computadora
```bash
npm run dev
```
Luego abre http://localhost:3000

### Publicar cambios en la URL de PRUEBA
```bash
npx vercel
```

### Publicar cambios en PRODUCCIÓN (lo que ve el cliente)
```bash
npx vercel --prod
```

### Si npm run dev dice "servidor ya corriendo"
```bash
kill <el número de PID que te muestre el mensaje>
npm run dev
```

---

## Flujo de trabajo recomendado

1. Haces cambios en el código (local)
2. Pruebas en `localhost:3000`
3. Conforme con el resultado → `npx vercel` (sube a la URL de Prueba)
4. Revisas la URL de Prueba con calma
5. Todo bien → `npx vercel --prod` (ahí sí lo ve el cliente)

---

## Recordatorio semanal (plan gratis de Supabase)

Ambos proyectos de Supabase (Producción y Prueba) se **pausan automáticamente
si nadie los usa por 7 días seguidos**. Entra al menos una vez por semana a
cada uno (aunque sea solo abrir el dashboard) para que no se pausen.

El más importante de no olvidar: **Producción** — si tu cliente no entra
seguido, ese es el que corre más riesgo.

Si esto se vuelve una molestia, la solución permanente es subir ese proyecto
a Supabase Pro ($25/mes) — elimina la pausa automática y agrega backups
diarios.

---

## Dónde está el código

Carpeta en tu Mac: `taller-webapp` (dentro de tu carpeta de usuario o donde
la hayas movido — usa `cd taller-webapp` desde la Terminal, o ábrela en
VS Code con File → Open Folder).

Archivo de configuración local: `.env.local` (no lo subas nunca a ningún
repositorio público — ya está protegido de eso, pero es bueno saberlo).

---

## Despliegue Vercel — estado y pasos recientes

El proyecto se vinculó y se desplegó en Vercel desde la carpeta `~/taller-webapp Visual`.

- **Directorio usado:** `~/taller-webapp Visual`
- **Team:** `septemberk825-6543s-projects`
- **Proyecto vinculado:** `septemberk825-6543s-projects/taller-webapp`
- **.env.local:** se descargaron las variables de entorno de `development`, Vercel creó `.env.local` y lo añadió a `.gitignore`.

Salida del flujo de `vercel` (preview):

```bash
Inspect: https://vercel.com/septemberk825-6543s-projects/taller-webapp/8bB4hKfQSJaMKinxpGKDktQhiiAh
Preview: https://taller-webapp-5np6618dt-septemberk825-6543s-projects.vercel.app
Ready in 29s
To deploy to production (taller-webapp-three.vercel.app), run `vercel --prod`
```

Salida del deploy a producción (`npx vercel --prod`):

```bash
Inspect: https://vercel.com/septemberk825-6543s-projects/taller-webapp/7AivmEtatvTfaEA4WtJwqiEqYdiP
Production: https://taller-webapp-qr0uldka0-septemberk825-6543s-projects.vercel.app
Aliased: https://taller-webapp-three.vercel.app
Ready in 28s
```

Notas importantes:
- Comprueba el `Preview` en una ventana de incógnito para validar acceso público.
- Verifica en Vercel → Project → Settings → Environment Variables que las claves sensibles (p. ej. `SUPABASE_SERVICE_ROLE_KEY`) están configuradas correctamente para `Preview` y `Production`.
- Si quieres que el enlace de preview no pida login, despliega desde una cuenta personal o desactiva la protección de previews en Settings (si la organización lo permite).

Si quieres, hago ahora un commit con esta actualización del fichero y/o subo los cambios al remoto.
