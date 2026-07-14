-- =============================================================================
-- ESQUEMA "TALLERON" — pégalo completo en Supabase > SQL Editor > New query > Run
-- Incluye tablas + datos de ejemplo para poder probar de inmediato.
-- =============================================================================

create table usuarios (
  id serial primary key,
  nombre text not null,
  rol text not null,
  pin text not null unique
);

create table clientes (
  id serial primary key,
  nombre text not null,
  telefono text not null
);

create table vehiculos (
  id serial primary key,
  cliente_id int references clientes(id) on delete cascade,
  placa text not null,
  marca text,
  modelo text,
  anio int,
  vin text
);

create table insumos (
  id serial primary key,
  nombre text not null,
  unidad text not null,
  cantidad_actual numeric not null default 0,
  costo numeric not null default 0
);

create table kits (
  id serial primary key,
  nombre text not null,
  precio numeric not null default 0,
  intervalo_dias int,   -- null = no dispara recordatorio preventivo
  intervalo_km int
);

create table kit_insumos (
  id serial primary key,
  kit_id int references kits(id) on delete cascade,
  insumo_id int references insumos(id) on delete restrict,
  cantidad numeric not null
);

create table ordenes_servicio (
  id serial primary key,
  folio text not null unique,
  vehiculo_id int references vehiculos(id) on delete cascade,
  fecha date not null default current_date,
  estado text not null default 'pendiente' check (estado in ('pendiente','en_progreso','entregado')),
  notas text
);

create table orden_detalle (
  id serial primary key,
  orden_id int references ordenes_servicio(id) on delete cascade,
  tipo text not null check (tipo in ('kit','insumo')),
  kit_id int references kits(id),
  insumo_id int references insumos(id),
  nombre text not null,
  cantidad numeric not null default 1,
  precio_unit numeric not null default 0
);

create table garantias (
  id serial primary key,
  orden_detalle_id int references orden_detalle(id) on delete cascade,
  dias int not null,
  fecha_fin date not null
);

create table fotos (
  id serial primary key,
  orden_detalle_id int references orden_detalle(id) on delete cascade,
  url text,
  descripcion text
);

create table movimientos_inventario (
  id serial primary key,
  insumo_id int references insumos(id),
  cantidad numeric not null,       -- negativo = salida, positivo = entrada
  tipo text not null check (tipo in ('entrada','salida')),
  orden_id int references ordenes_servicio(id),
  fecha date not null default current_date,
  usuario text
);

-- -----------------------------------------------------------------------------
-- RLS: se deja habilitado SIN políticas para anon/authenticated. Esto bloquea
-- por completo el acceso directo desde el navegador. Todas las lecturas y
-- escrituras de la app pasan por las rutas API de Next.js, que usan la
-- service_role key (esa key SIEMPRE se salta RLS, se ejecuta solo en el
-- servidor y nunca se expone al cliente).
-- -----------------------------------------------------------------------------
alter table usuarios enable row level security;
alter table clientes enable row level security;
alter table vehiculos enable row level security;
alter table insumos enable row level security;
alter table kits enable row level security;
alter table kit_insumos enable row level security;
alter table ordenes_servicio enable row level security;
alter table orden_detalle enable row level security;
alter table garantias enable row level security;
alter table fotos enable row level security;
alter table movimientos_inventario enable row level security;
-- (sin "create policy": cero acceso para anon/authenticated, todo pasa por el backend)

-- =============================================================================
-- DATOS DE EJEMPLO
-- =============================================================================

insert into usuarios (nombre, rol, pin) values
  ('Carlos Mendoza', 'Mecánico jefe', '1234'),
  ('Ana Torres', 'Recepción', '5678');

insert into clientes (nombre, telefono) values
  ('Roberto Salinas', '6612-3456'),
  ('Marta Jiménez', '6698-7654'),
  ('Luis Ábrego', '6644-2210');

insert into vehiculos (cliente_id, placa, marca, modelo, anio, vin) values
  (1, 'PBB-4521', 'Toyota', 'Hilux', 2019, '8XAJH14G0K0004521'),
  (2, 'PCC-1187', 'Nissan', 'Sentra', 2021, '3N1AB7AP7ML001187'),
  (1, 'PBD-9032', 'Kia', 'Rio', 2020, 'KNADM4A31L6009032'),
  (3, 'PAA-0087', 'Chevrolet', 'NPR', 2017, '9GDNP71A8H0100087');

insert into insumos (nombre, unidad, cantidad_actual, costo) values
  ('Aceite 15W-40', 'L', 32, 6.5),
  ('Filtro de aceite', 'pza', 14, 4.2),
  ('Filtro de aire', 'pza', 9, 5.8),
  ('Pastillas de freno (juego)', 'juego', 6, 22),
  ('Bujía', 'pza', 40, 3.1),
  ('Líquido de frenos DOT4', 'L', 11, 7.4);

insert into kits (nombre, precio, intervalo_dias, intervalo_km) values
  ('Cambio de aceite estándar', 45, 150, 5000),
  ('Servicio mayor 20,000km', 120, 365, 20000),
  ('Servicio de frenos delanteros', 65, null, null);

insert into kit_insumos (kit_id, insumo_id, cantidad) values
  (1, 1, 4), (1, 2, 1),
  (2, 1, 4), (2, 2, 1), (2, 3, 1), (2, 5, 4),
  (3, 4, 1), (3, 6, 1);

insert into ordenes_servicio (folio, vehiculo_id, fecha, estado, notas) values
  ('OS-1042', 1, '2026-07-03', 'entregado', 'Ruido leve al frenar, revisado.'),
  ('OS-1043', 2, '2026-07-06', 'en_progreso', ''),
  ('OS-0981', 3, '2025-10-01', 'entregado', 'Cambio de aceite de rutina.'),
  ('OS-1011', 4, '2026-02-15', 'entregado', 'Mantenimiento preventivo de flotilla.');

insert into orden_detalle (orden_id, tipo, kit_id, nombre, cantidad, precio_unit) values
  (1, 'kit', 1, 'Cambio de aceite estándar', 1, 45),
  (2, 'kit', 3, 'Servicio de frenos delanteros', 1, 65),
  (3, 'kit', 1, 'Cambio de aceite estándar', 1, 45),
  (4, 'kit', 1, 'Cambio de aceite estándar', 2, 45);

insert into garantias (orden_detalle_id, dias, fecha_fin) values
  (1, 90, '2026-10-01'),
  (2, 60, '2026-09-04'),
  (3, 90, '2025-12-30'),
  (4, 90, '2026-05-16');
