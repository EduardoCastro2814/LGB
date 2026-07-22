-- =========================================================================
-- SCRIPT DE MIGRACIÓN Y CREACIÓN DE ESQUEMA PARA SUPABASE (Lean Green Belt)
-- =========================================================================
-- Este script es IDEMPOTENTE: puede ejecutarse múltiples veces en el SQL Editor
-- de Supabase y agregará únicamente las tablas, columnas, restricciones e índices
-- faltantes sin alterar ni borrar los datos existentes en producción.

-- -------------------------------------------------------------------------
-- 1. EXTENSIONES DE BASE DE DATOS
-- -------------------------------------------------------------------------
-- Habilitar pgcrypto o uuid-ossp en caso de requerir generación de UUIDs.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 2. TABLA DE ROLES
-- -------------------------------------------------------------------------
-- Crea un catálogo formal para validación de roles en la aplicación.
CREATE TABLE IF NOT EXISTS public.roles (
    name text PRIMARY KEY,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Insertar roles iniciales requeridos por las reglas del negocio
INSERT INTO public.roles (name, description) VALUES
('Admin', 'Administrador con acceso a dashboard, matrices de entrenamiento e importadores'),
('User', 'Colaborador con acceso exclusivo a Academia Lean para realizar capacitaciones y exámenes')
ON CONFLICT (name) DO NOTHING;

-- -------------------------------------------------------------------------
-- 3. TABLA DE EMPLEADOS (employees)
-- -------------------------------------------------------------------------
-- Almacena la base de datos de headcount y su estatus del programa LGB.
CREATE TABLE IF NOT EXISTS public.employees (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_number text UNIQUE NOT NULL,
    name text NOT NULL,
    department text NOT NULL,
    employee_type text NOT NULL DEFAULT 'DL', -- 'DL' | 'IDL'
    role text NOT NULL DEFAULT 'User', -- 'Admin' | 'User'
    certification_status text NOT NULL DEFAULT 'Por Certificar', -- 'Certificado' | 'Potencial' | 'Por Certificar'
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Asegurar la existencia de todas las columnas esperadas por la aplicación
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS employee_number text UNIQUE NOT NULL;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS puesto text DEFAULT 'Operador DL';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS manager text DEFAULT 'N/A';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS employee_type text NOT NULL DEFAULT 'DL';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'User';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS certification_status text NOT NULL DEFAULT 'Por Certificar';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Añadir restricción FK de integridad referencial para los roles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'employees_role_fkey' AND table_name = 'employees'
    ) THEN
        ALTER TABLE public.employees 
        ADD CONSTRAINT employees_role_fkey 
        FOREIGN KEY (role) REFERENCES public.roles(name) ON UPDATE CASCADE;
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- 4. TABLA DE CURSOS (courses)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    duration text,
    order_num integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS order_num integer NOT NULL DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- -------------------------------------------------------------------------
-- 5. TABLA DE CONTENIDO DE CURSO (course_content)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_content (
    id text PRIMARY KEY,
    course_id text REFERENCES public.courses(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL, -- 'pdf' | 'ppt' | 'video' | 'image'
    url text NOT NULL,
    size text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.course_content ADD COLUMN IF NOT EXISTS size text;

-- -------------------------------------------------------------------------
-- 6. TABLA DE EXÁMENES (exams)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exams (
    course_id text PRIMARY KEY REFERENCES public.courses(id) ON DELETE CASCADE,
    min_score integer NOT NULL DEFAULT 80,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS min_score integer NOT NULL DEFAULT 80;

-- -------------------------------------------------------------------------
-- 7. TABLA DE PREGUNTAS (questions)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id text PRIMARY KEY,
    exam_id text REFERENCES public.exams(course_id) ON DELETE CASCADE,
    text text NOT NULL,
    options jsonb NOT NULL, -- Array de opciones de pregunta
    correct_option_index integer NOT NULL,
    points integer NOT NULL DEFAULT 10,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 10;

-- -------------------------------------------------------------------------
-- 8. TABLA DE PROGRESO DE CURSO (course_progress)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_progress (
    employee_number text NOT NULL REFERENCES public.employees(employee_number) ON DELETE CASCADE,
    course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'no-iniciado', -- 'no-iniciado' | 'en-progreso' | 'completado'
    progress integer NOT NULL DEFAULT 0,
    content_viewed boolean NOT NULL DEFAULT false,
    exam_attempts integer NOT NULL DEFAULT 0,
    exam_score integer,
    exam_passed boolean NOT NULL DEFAULT false,
    completion_date text,
    certificate_folio text,
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (employee_number, course_id)
);

ALTER TABLE public.course_progress ADD COLUMN IF NOT EXISTS content_viewed boolean NOT NULL DEFAULT false;
ALTER TABLE public.course_progress ADD COLUMN IF NOT EXISTS exam_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE public.course_progress ADD COLUMN IF NOT EXISTS exam_score integer;
ALTER TABLE public.course_progress ADD COLUMN IF NOT EXISTS exam_passed boolean NOT NULL DEFAULT false;
ALTER TABLE public.course_progress ADD COLUMN IF NOT EXISTS completion_date text;
ALTER TABLE public.course_progress ADD COLUMN IF NOT EXISTS certificate_folio text;

-- -------------------------------------------------------------------------
-- 9. TABLA DE CERTIFICADOS (certificates)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
    id text PRIMARY KEY,
    employee_number text NOT NULL REFERENCES public.employees(employee_number) ON DELETE CASCADE,
    course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_name text NOT NULL,
    date_issued text NOT NULL,
    grade integer NOT NULL,
    folio text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- -------------------------------------------------------------------------
-- 10. ÍNDICES DE BASE DE DATOS OPTIMIZADOS
-- -------------------------------------------------------------------------
-- Crear índices para acelerar búsquedas frecuentes y operaciones de unión de datos.
CREATE INDEX IF NOT EXISTS idx_employees_number ON public.employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);
CREATE INDEX IF NOT EXISTS idx_course_content_course ON public.course_content(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam ON public.questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_emp ON public.course_progress(employee_number);
CREATE INDEX IF NOT EXISTS idx_course_progress_course ON public.course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_emp ON public.certificates(employee_number);
CREATE INDEX IF NOT EXISTS idx_certificates_folio ON public.certificates(folio);
