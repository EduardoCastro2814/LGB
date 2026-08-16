-- =========================================================================
-- SCRIPT DE RESTABLECIMIENTO Y RECREACIÓN DE ESQUEMA PARA SUPABASE (Lean Green Belt)
-- =========================================================================
-- ADVERTENCIA: Este script elimina por completo todas las tablas de la base de
-- datos actual y las vuelve a crear vacías con el esquema correcto esperado
-- por el frontend. Ejecútelo con precaución.

-- 1. ELIMINAR COMPLETAMENTE LAS TABLAS EN ORDEN DE DEPENDENCIAS
DROP TABLE IF EXISTS public.applied_tools CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.course_progress CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.course_content CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- 2. HABILITAR EXTENSIÓN PARA GENERAR UUIDS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. TABLA DE ROLES
CREATE TABLE public.roles (
    name text PRIMARY KEY,
    description text,
    created_at timestamptz DEFAULT now()
);

-- 4. TABLA DE EMPLEADOS (employees)
CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_number text UNIQUE NOT NULL,
    name text NOT NULL,
    department text NOT NULL,
    puesto text DEFAULT 'Operador DL',
    manager text DEFAULT 'N/A',
    employee_type text NOT NULL DEFAULT 'DL', -- 'DL' | 'IDL'
    role text NOT NULL DEFAULT 'User' REFERENCES public.roles(name) ON UPDATE CASCADE,
    certification_status text NOT NULL DEFAULT 'Por Certificar', -- 'Certificado' | 'Potencial' | 'Por Certificar'
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. TABLA DE CURSOS (courses)
CREATE TABLE public.courses (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    duration text,
    order_num integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 6. TABLA DE MATERIAL DE CURSO (course_content)
CREATE TABLE public.course_content (
    id text PRIMARY KEY,
    course_id text REFERENCES public.courses(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL, -- 'pdf' | 'ppt' | 'video' | 'image'
    url text NOT NULL,
    size text,
    created_at timestamptz DEFAULT now()
);

-- 7. TABLA DE EXÁMENES (exams)
CREATE TABLE public.exams (
    course_id text PRIMARY KEY REFERENCES public.courses(id) ON DELETE CASCADE,
    min_score integer NOT NULL DEFAULT 80,
    created_at timestamptz DEFAULT now()
);

-- 8. TABLA DE PREGUNTAS (questions)
CREATE TABLE public.questions (
    id text PRIMARY KEY,
    exam_id text REFERENCES public.exams(course_id) ON DELETE CASCADE,
    text text NOT NULL,
    options jsonb NOT NULL, -- Array de opciones de pregunta (strings)
    correct_option_index integer NOT NULL,
    points integer NOT NULL DEFAULT 10,
    created_at timestamptz DEFAULT now()
);

-- 9. TABLA DE PROGRESO DE CURSO (course_progress)
CREATE TABLE public.course_progress (
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

-- 10. TABLA DE CERTIFICADOS (certificates)
CREATE TABLE public.certificates (
    id text PRIMARY KEY,
    employee_number text NOT NULL REFERENCES public.employees(employee_number) ON DELETE CASCADE,
    course_id text NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_name text NOT NULL,
    date_issued text NOT NULL,
    grade integer NOT NULL,
    folio text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 11. ÍNDICES DE BASE DE DATOS OPTIMIZADOS
CREATE INDEX idx_employees_number ON public.employees(employee_number);
CREATE INDEX idx_employees_role ON public.employees(role);
CREATE INDEX idx_course_content_course ON public.course_content(course_id);
CREATE INDEX idx_questions_exam ON public.questions(exam_id);
CREATE INDEX idx_course_progress_emp ON public.course_progress(employee_number);
CREATE INDEX idx_course_progress_course ON public.course_progress(course_id);
CREATE INDEX idx_certificates_emp ON public.certificates(employee_number);
CREATE INDEX idx_certificates_folio ON public.certificates(folio);

-- 12. HABILITAR RLS Y DEFINIR POLÍTICAS DE ACCESO COMPLETO (CRUD) PARA CLIENTES
-- Esto permite el funcionamiento CRUD directo de anon/authenticated para pruebas y uso normal de la app.

-- Tabla: roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select a todos en roles" ON public.roles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insert a todos en roles" ON public.roles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir update a todos en roles" ON public.roles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete a todos en roles" ON public.roles FOR DELETE TO anon, authenticated USING (true);

-- Tabla: employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select a todos en employees" ON public.employees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insert a todos en employees" ON public.employees FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir update a todos en employees" ON public.employees FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete a todos en employees" ON public.employees FOR DELETE TO anon, authenticated USING (true);

-- Tabla: courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select a todos en courses" ON public.courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insert a todos en courses" ON public.courses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir update a todos en courses" ON public.courses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete a todos en courses" ON public.courses FOR DELETE TO anon, authenticated USING (true);

-- Tabla: course_content
ALTER TABLE public.course_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select a todos en course_content" ON public.course_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insert a todos en course_content" ON public.course_content FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir update a todos en course_content" ON public.course_content FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete a todos en course_content" ON public.course_content FOR DELETE TO anon, authenticated USING (true);

-- Tabla: exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select a todos en exams" ON public.exams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insert a todos en exams" ON public.exams FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir update a todos en exams" ON public.exams FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete a todos en exams" ON public.exams FOR DELETE TO anon, authenticated USING (true);

-- Tabla: questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select a todos en questions" ON public.questions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insert a todos en questions" ON public.questions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir update a todos en questions" ON public.questions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete a todos en questions" ON public.questions FOR DELETE TO anon, authenticated USING (true);

-- Tabla: course_progress
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select a todos en course_progress" ON public.course_progress FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insert a todos en course_progress" ON public.course_progress FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir update a todos en course_progress" ON public.course_progress FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete a todos en course_progress" ON public.course_progress FOR DELETE TO anon, authenticated USING (true);

-- Tabla: certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select a todos en certificates" ON public.certificates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insert a todos en certificates" ON public.certificates FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir update a todos en certificates" ON public.certificates FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete a todos en certificates" ON public.certificates FOR DELETE TO anon, authenticated USING (true);

-- 13. SEMBRADO DE ROLES Y DATOS INICIALES EXIGIDOS
-- Roles administrativos y de usuario
INSERT INTO public.roles (name, description) VALUES
('Admin', 'Administrador con acceso a dashboard, matrices de entrenamiento e importadores'),
('User', 'Colaborador con acceso exclusivo a Academia Lean para realizar capacitaciones y exámenes')
ON CONFLICT (name) DO NOTHING;

-- Cursos predeterminados
INSERT INTO public.courses (id, name, description, duration, order_num, is_active) VALUES
('lean-basics-1', 'Lean Basics 1', 'Conceptos básicos de manufactura esbelta, desperdicios y valor agregado en líneas de producción.', '2 horas', 1, true),
('5s-1', '5S + 1', 'Metodología clásica de las 5S con enfoque transversal en la Seguridad (+1).', '1.5 horas', 2, true),
('5-whys', '5 Whys', 'Herramienta de análisis de causa raíz que indaga de manera iterativa el origen físico y de gestión de una falla.', '1 hora', 3, true),
('7-ways', '7 Ways', 'Resolución analítica de problemas orientada a proponer y seleccionar de entre 7 opciones distintas de solución.', '2 horas', 4, true),
('sga-guide', 'Small Group Activities (SGA) Guide', 'Guía de trabajo para la ejecución de proyectos de mejora en equipos pequeños y círculos de calidad.', '3 horas', 5, true)
ON CONFLICT (id) DO NOTHING;

-- Exámenes de los cursos
INSERT INTO public.exams (course_id, min_score) VALUES
('lean-basics-1', 80),
('5s-1', 80),
('5-whys', 80),
('7-ways', 80),
('sga-guide', 80)
ON CONFLICT (course_id) DO NOTHING;

-- Preguntas de los exámenes
-- Lean Basics 1
INSERT INTO public.questions (id, exam_id, text, options, correct_option_index, points) VALUES
('lb-q1', 'lean-basics-1', '¿Qué es Lean y cuál es su enfoque según el material del curso?', '["Un sistema para automatizar la producción con tecnología de punta", "Un enfoque sistemático para identificar y eliminar actividades que no agregan valor de los procesos", "Un método enfocado en contratar más personal para acelerar los ensambles", "Un plan trimestral de ventas para aumentar el catálogo de productos"]'::jsonb, 1, 10),
('lb-q2', 'lean-basics-1', '¿Cómo se define "Valor" y "Desperdicio (Muda)" en la filosofía Lean?', '["Valor es todo proceso por el cual el cliente está dispuesto a pagar; Desperdicio es toda actividad que no agrega valor", "Valor es el costo total de los materiales; Desperdicio es el desecho de cartón y plásticos en la línea", "Valor es la velocidad de las máquinas; Desperdicio es el mantenimiento preventivo", "Valor es el espacio del almacén; Desperdicio es el tiempo extra del supervisor"]'::jsonb, 0, 10),
('lb-q3', 'lean-basics-1', 'En la historia de Lean, ¿qué aportes clave hicieron Sakichi Toyoda (1896) y Kiichiro Toyoda (1927)?', '["Sakichi introdujo el Mapeo de Flujo de Valor (VSM) y Kiichiro el sistema de Supermercado", "Sakichi diseñó los Poka-Yokes y Kiichiro la matriz TIM WOODS", "Sakichi introdujo el concepto de Jidoka (autonomatización) y Kiichiro introdujo el concepto Just-In-Time (JIT) con transportadores de cadena", "Sakichi creó la nivelación Heijunka y Kiichiro el Try-storming"]'::jsonb, 2, 10),
('lb-q4', 'lean-basics-1', '¿Quién es conocido como el Arquitecto del TPS y padre del sistema de control de inventario de Supermercado?', '["Taiichi Ohno", "Dr. Shigeo Shingo", "Kiichiro Toyoda", "Sakichi Toyoda"]'::jsonb, 0, 10),
('lb-q5', 'lean-basics-1', '¿Qué conceptos de precisión en manufactura desarrolló el Dr. Shigeo Shingo en la década de 1960?', '["El Justo a Tiempo (JIT) y transportadores de cadena", "Los conceptos de Poka-Yoke (a prueba de errores) y SMED (cambio de herramientas en un dígito de minuto)", "Las 5S y el tablero Heijunka", "La matriz de desperdicios TIM WOODS"]'::jsonb, 1, 10),
('lb-q6', 'lean-basics-1', '¿Cuáles son los 5 Principios Lean para guiar la mejora continua?', '["Clasificar, Ordenar, Limpiar, Estandarizar y Mantener", "JIT, Jidoka, Heijunka, 5S+1 y VSM", "Transporte, Inventario, Movimiento, Espera y Defectos", "Valor, Flujo de Valor, Flujo, Pull (Jalar) y Perfección"]'::jsonb, 3, 10),
('lb-q7', 'lean-basics-1', 'En el modelo de la Casa Flex Lean Enterprise (FLE), ¿cuáles son los cimientos operativos (base del templo)?', '["JIT y Jidoka", "Heijunka y Talento No Utilizado", "5S+1, VSM y Supermercado", "El cliente final y la gerencia de planta"]'::jsonb, 2, 10),
('lb-q8', 'lean-basics-1', 'En la matriz TIM WOODS de desperdicios, ¿qué representan la "W" y la "+1" o "S" final?', '["W representa Espera (Waiting); S representa Talento No Utilizado (Skills)", "W representa Desecho (Waste); S representa Seguridad (Safety)", "W representa Movimiento de Agua (Water Spider); S representa Velocidad (Speed)", "W representa Trabajo (Work); S representa Supervisor"]'::jsonb, 0, 10),
('lb-q9', 'lean-basics-1', '¿Qué herramientas representan la base del orden y la radiografía visual de los flujos de material e información?', '["El Try-storming y la nivelación Heijunka", "La metodología 5S+1 y el Mapeo de Flujo de Valor (VSM)", "El sistema Push y las Small Group Activities (SGA)", "La matriz TIM WOODS y el sistema FIFO"]'::jsonb, 1, 10),
('lb-q10', 'lean-basics-1', '¿Qué es el Sistema Pull, el Supermercado y las prácticas de ADN Kaizen (Las 3 GEN y Try-storming)?', '["Pull es empujar producción; Supermercado es guardar exceso; 3 GEN es planear en oficina; Try-storming es debatir ideas sin actuar", "Pull es nivelar la línea Heijunka; Supermercado es control de sueldos; 3 GEN es clasificar herramientas; Try-storming es reportar scrap", "Pull es aumentar velocidad de máquinas; Supermercado es almacén externo; 3 GEN es auditoría mensual; Try-storming es simular en computadora", "Pull es jalar según demanda; Supermercado repone según el retiro del cliente; 3 GEN es observar piso, pieza y hechos reales; Try-storming es experimentación física rápida"]'::jsonb, 3, 10)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    options = EXCLUDED.options,
    correct_option_index = EXCLUDED.correct_option_index,
    points = EXCLUDED.points;

-- 5S + 1
INSERT INTO public.questions (id, exam_id, text, options, correct_option_index, points) VALUES
('5s-q1', '5s-1', '¿Qué significa Seiri en la metodología de las 5S?', '["Limpiar la maquinaria al final del turno", "Clasificar y separar los elementos necesarios de los innecesarios", "Estandarizar las ayudas visuales de la estación", "Tener disciplina para llegar a tiempo"]'::jsonb, 1, 10),
('5s-q2', '5s-1', 'En la práctica de "5S + 1", ¿qué representa la suma de "+ 1"?', '["Una hora adicional de sobretiempo", "Seguridad laboral (mitigación de riesgos)", "Un operador extra en la línea", "Una inspección adicional de calidad"]'::jsonb, 1, 10),
('5s-q3', '5s-1', 'El lema "Un lugar para cada cosa y cada cosa en su lugar" corresponde a:', '["Seiton (Ordenar)", "Seiso (Limpiar)", "Seiri (Clasificar)", "Shitsuke (Disciplina)"]'::jsonb, 0, 10)
ON CONFLICT (id) DO NOTHING;

-- 5 Porqués
INSERT INTO public.questions (id, exam_id, text, options, correct_option_index, points) VALUES
('fw-q1', '5-whys', '¿Cuál es el propósito primordial de la herramienta de los 5 Porqués?', '["Encontrar al operador responsable del error en la línea", "Identificar la causa raíz de un problema para evitar su repetición", "Proponer 5 soluciones Kaizen alternativas rápidamente", "Llenar el papeleo administrativo de incidentes"]'::jsonb, 1, 10),
('fw-q2', '5-whys', '¿Cuántas preguntas de "¿Por qué?" se deben realizar en esta herramienta?', '["Exactamente 5 preguntas en todos los casos obligatoriamente", "Siempre 3 preguntas para ser rápidos", "Las necesarias hasta llegar a la verdadera causa raíz (típicamente 5)", "Ninguna, se deduce directamente de la primera respuesta"]'::jsonb, 2, 10),
('fw-q3', '5-whys', '¿Por qué se debe ir al Gemba (piso de trabajo) al realizar los 5 Porqués?', '["Para hablar con la gerencia de planta", "Para verificar los hechos y la evidencia real sin basarse en suposiciones", "Para detener la línea de producción", "Para limpiar la máquina que falló"]'::jsonb, 1, 10)
ON CONFLICT (id) DO NOTHING;

-- 7 Ways
INSERT INTO public.questions (id, exam_id, text, options, correct_option_index, points) VALUES
('7w-q1', '7-ways', '¿Qué busca promover la herramienta "7 Ways"?', '["Resolver el problema en 7 minutos", "Limitar las ideas del equipo a 1 sola solución obvia", "Forzar la generación de al menos 7 ideas de solución distintas ante un problema", "Tener 7 operadores en cada reunión Kaizen"]'::jsonb, 2, 10),
('7w-q2', '7-ways', 'Al evaluar los "7 Ways", ¿qué factores se ponderan típicamente?', '["Costo, Esfuerzo de implementación, Impacto en calidad y Factibilidad", "La opinión del supervisor de producción únicamente", "El color de las máquinas a modificar", "Ninguno, se escoge la idea al azar"]'::jsonb, 0, 10),
('7w-q3', '7-ways', '¿Qué fase sigue inmediatamente después de evaluar los 7 Ways?', '["Olvidar el problema y continuar la rutina", "Seleccionar la mejor alternativa o combinación, e implementar un plan de acción", "Despedir al equipo de ingenieros de calidad", "Volver a empezar a buscar otros 7 ways"]'::jsonb, 1, 10)
ON CONFLICT (id) DO NOTHING;

-- SGA Guide
INSERT INTO public.questions (id, exam_id, text, options, correct_option_index, points) VALUES
('sg-q1', 'sga-guide', '¿Qué significan las siglas SGA en mejora continua?', '["Sistema de Gestión de Almacenes", "Small Group Activities (Actividades de Grupos Pequeños)", "Soporte Gráfico de Aprendizaje", "Seguimiento General de Acciones"]'::jsonb, 1, 10),
('sg-q2', 'sga-guide', '¿Cuál es el rol del Facilitador en un equipo de SGA?', '["Asesorar al equipo en la metodología Lean y guiar la resolución del problema", "Realizar todas las tareas del Kaizen en su oficina", "Tomar las decisiones definitivas del equipo de manera autoritaria", "Solo tomar lista de asistencia en las reuniones"]'::jsonb, 0, 10),
('sg-q3', 'sga-guide', '¿Cuál es el beneficio de involucrar al personal operativo (DL) en un SGA?', '["Reducir los sueldos del personal de línea", "Aprovechar el conocimiento real de quienes ejecutan el proceso para mejorar calidad y productividad", "Hacer que trabajen más horas extras sin pago", "Eliminar los puestos de supervisores"]'::jsonb, 1, 10)
ON CONFLICT (id) DO NOTHING;

-- 14. TABLA DE HERRAMIENTAS APLICADAS (applied_tools) Y POLÍTICAS
CREATE TABLE public.applied_tools (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_number text NOT NULL REFERENCES public.employees(employee_number) ON DELETE CASCADE,
    tool_name text NOT NULL,
    custom_tool_name text,
    application text NOT NULL,
    result text NOT NULL,
    comment text NOT NULL,
    status text NOT NULL DEFAULT 'Pendiente',
    admin_comment text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.applied_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir select a todos en applied_tools" ON public.applied_tools FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insert a todos en applied_tools" ON public.applied_tools FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir update a todos en applied_tools" ON public.applied_tools FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete a todos en applied_tools" ON public.applied_tools FOR DELETE TO anon, authenticated USING (true);

-- Index
CREATE INDEX idx_applied_tools_emp ON public.applied_tools(employee_number);

