-- =========================================================================
-- MIGRACIÓN DE BD PARA EL MÓDULO DE COMPETENCIAS Y VALIDACIÓN DE LINEPULSE
-- =========================================================================
-- Ejecutar este script en el SQL Editor de Supabase para agregar las tablas
-- y RLS necesarios.

-- 1. TABLA DE ESTACIONES (catálogo de estaciones)
CREATE TABLE IF NOT EXISTS public.stations (
    id text PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 2. TABLA DE REQUERIMIENTOS DE ENTRENAMIENTO POR ESTACIÓN
CREATE TABLE IF NOT EXISTS public.station_requirements (
    id SERIAL PRIMARY KEY,
    station_id text REFERENCES public.stations(id) ON DELETE CASCADE,
    training_name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (station_id, training_name)
);

-- 3. TABLA DE REGISTROS DE ENTRENAMIENTOS DE EMPLEADOS
CREATE TABLE IF NOT EXISTS public.training_records (
    id SERIAL PRIMARY KEY,
    employee_number text NOT NULL,
    employee_name text NOT NULL,
    training_name text NOT NULL,
    status text NOT NULL,
    completion_date text,
    created_at timestamptz DEFAULT now()
);

-- 4. TABLA DE POSICIONES EN EL LAYOUT
CREATE TABLE IF NOT EXISTS public.layout_positions (
    id SERIAL PRIMARY KEY,
    code text UNIQUE NOT NULL, -- e.g. 'POS01', 'POS02', ...
    station_id text REFERENCES public.stations(id) ON DELETE SET NULL,
    employee_number text, -- ID del operador asignado actualmente (opcional)
    coverage_type text NOT NULL DEFAULT 'Normal', -- 'Normal' | 'Comedor'
    line text DEFAULT 'Línea 1',
    shift text DEFAULT 'Turno 1',
    updated_at timestamptz DEFAULT now()
);

-- -------------------------------------------------------------------------
-- HABILITACIÓN DE RLS Y POLÍTICAS DE ACCESO
-- -------------------------------------------------------------------------

-- Tabla: stations
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir select a todos en stations" ON public.stations;
CREATE POLICY "Permitir select a todos en stations" ON public.stations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Permitir insert a todos en stations" ON public.stations;
CREATE POLICY "Permitir insert a todos en stations" ON public.stations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir update a todos en stations" ON public.stations;
CREATE POLICY "Permitir update a todos en stations" ON public.stations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir delete a todos en stations" ON public.stations;
CREATE POLICY "Permitir delete a todos en stations" ON public.stations FOR DELETE TO anon, authenticated USING (true);

-- Tabla: station_requirements
ALTER TABLE public.station_requirements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir select a todos en station_requirements" ON public.station_requirements;
CREATE POLICY "Permitir select a todos en station_requirements" ON public.station_requirements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Permitir insert a todos en station_requirements" ON public.station_requirements;
CREATE POLICY "Permitir insert a todos en station_requirements" ON public.station_requirements FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir update a todos en station_requirements" ON public.station_requirements;
CREATE POLICY "Permitir update a todos en station_requirements" ON public.station_requirements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir delete a todos en station_requirements" ON public.station_requirements;
CREATE POLICY "Permitir delete a todos en station_requirements" ON public.station_requirements FOR DELETE TO anon, authenticated USING (true);

-- Tabla: training_records
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir select a todos en training_records" ON public.training_records;
CREATE POLICY "Permitir select a todos en training_records" ON public.training_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Permitir insert a todos en training_records" ON public.training_records;
CREATE POLICY "Permitir insert a todos en training_records" ON public.training_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir update a todos en training_records" ON public.training_records;
CREATE POLICY "Permitir update a todos en training_records" ON public.training_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir delete a todos en training_records" ON public.training_records;
CREATE POLICY "Permitir delete a todos en training_records" ON public.training_records FOR DELETE TO anon, authenticated USING (true);

-- Tabla: layout_positions
ALTER TABLE public.layout_positions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir select a todos en layout_positions" ON public.layout_positions;
CREATE POLICY "Permitir select a todos en layout_positions" ON public.layout_positions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Permitir insert a todos en layout_positions" ON public.layout_positions;
CREATE POLICY "Permitir insert a todos en layout_positions" ON public.layout_positions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir update a todos en layout_positions" ON public.layout_positions;
CREATE POLICY "Permitir update a todos en layout_positions" ON public.layout_positions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir delete a todos en layout_positions" ON public.layout_positions;
CREATE POLICY "Permitir delete a todos en layout_positions" ON public.layout_positions FOR DELETE TO anon, authenticated USING (true);

-- -------------------------------------------------------------------------
-- SEMBRADO DE DATOS VIGENTES (SEED DATA)
-- -------------------------------------------------------------------------

-- Estaciones iniciales del catálogo
INSERT INTO public.stations (id, name) VALUES
('stencil', 'Stencil'),
('spi', 'SPI'),
('siplace-01', 'Siplace 01'),
('siplace-02', 'Siplace 02'),
('aoi', 'AOI'),
('rayos-x', 'Rayos X'),
('empaque', 'Empaque'),
('test', 'Test')
ON CONFLICT (id) DO NOTHING;

-- Requerimientos de entrenamiento por defecto
INSERT INTO public.station_requirements (station_id, training_name) VALUES
('stencil', 'SMT Básico'),
('spi', 'SMT Básico'),
('spi', 'SPI'),
('rayos-x', 'SMT Básico'),
('rayos-x', 'Certificación Rayos X'),
('siplace-01', 'SMT Básico'),
('siplace-01', 'Siplace'),
('siplace-02', 'SMT Básico'),
('siplace-02', 'Siplace')
ON CONFLICT (station_id, training_name) DO NOTHING;

-- Posiciones iniciales del layout
INSERT INTO public.layout_positions (code, station_id, line, shift) VALUES
('POS01', 'stencil', 'Línea 1', 'Turno 1'),
('POS02', 'spi', 'Línea 1', 'Turno 1'),
('POS03', 'siplace-01', 'Línea 1', 'Turno 1'),
('POS04', 'siplace-02', 'Línea 1', 'Turno 1'),
('POS05', 'aoi', 'Línea 1', 'Turno 1'),
('POS06', 'rayos-x', 'Línea 1', 'Turno 1')
ON CONFLICT (code) DO NOTHING;
