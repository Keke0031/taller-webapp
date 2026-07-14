-- =============================================================================
-- MIGRACIÓN — solo si YA corriste antes el schema.sql viejo (con políticas
-- "acceso_total_demo" abiertas). Esto reemplaza esas políticas por unas que
-- exigen sesión autenticada, SIN borrar tus datos.
-- Pégalo en el SQL Editor y dale Run.
-- =============================================================================

drop policy if exists "acceso_total_demo" on usuarios;
drop policy if exists "acceso_total_demo" on clientes;
drop policy if exists "acceso_total_demo" on vehiculos;
drop policy if exists "acceso_total_demo" on insumos;
drop policy if exists "acceso_total_demo" on kits;
drop policy if exists "acceso_total_demo" on kit_insumos;
drop policy if exists "acceso_total_demo" on ordenes_servicio;
drop policy if exists "acceso_total_demo" on orden_detalle;
drop policy if exists "acceso_total_demo" on garantias;
drop policy if exists "acceso_total_demo" on fotos;
drop policy if exists "acceso_total_demo" on movimientos_inventario;

create policy "solo_autenticados" on usuarios for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo_autenticados" on clientes for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo_autenticados" on vehiculos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo_autenticados" on insumos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo_autenticados" on kits for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo_autenticados" on kit_insumos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo_autenticados" on ordenes_servicio for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo_autenticados" on orden_detalle for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo_autenticados" on garantias for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo_autenticados" on fotos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "solo_autenticados" on movimientos_inventario for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
