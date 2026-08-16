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
('5s-q1', '5s-1', '¿Cuál es el objetivo principal de la metodología de las 5S + 1 en el lugar de trabajo?', '["Aumentar la cantidad de operadores en la línea de ensamble", "Lograr un ambiente de trabajo ordenado, limpio, seguro y disciplinado para mejorar la productividad", "Reducir el sueldo de los trabajadores que cometen errores", "Comprar más maquinaria para automatizar el 100% de la producción"]'::jsonb, 1, 10),
('5s-q2', '5s-1', '¿Qué significa el primer paso "Seiri" (Clasificar)?', '["Pintar las líneas de tráfico peatonal en el piso", "Barrer y sacudir el polvo de toda el área", "Separar las herramientas y materiales necesarios de los innecesarios, eliminando estos últimos", "Tomar fotos de \\"antes y después\\" de la estación"]'::jsonb, 2, 10),
('5s-q3', '5s-1', 'La regla de oro asociada al segundo paso, "Seiton" (Ordenar) se define como:', '["Un lugar para cada cosa y cada cosa en su lugar", "Limpiar más para producir más rápido", "Tirar todo lo que no se use hoy", "Estandarizar las firmas de los reportes"]'::jsonb, 0, 10),
('5s-q4', '5s-1', 'En el paso "Seiso" (Limpiar), además de limpiar la suciedad, ¿qué acción crítica se debe realizar?', '["Evaluar la asistencia de los trabajadores", "Inspeccionar los equipos para detectar anomalías, fugas o fallas potenciales", "Tomar el tiempo de ciclo de la máquina", "Cambiar el color de los contenedores de basura"]'::jsonb, 1, 10),
('5s-q5', '5s-1', '¿Qué busca lograr el cuarto paso, "Seiketsu" (Estandarizar)?', '["Eliminar la necesidad de auditorías de control", "Rediseñar la distribución física de la planta entera", "Contratar a un inspector externo de limpieza", "Definir ayudas visuales, etiquetas y reglas claras para mantener los logros de las primeras 3S"]'::jsonb, 3, 10),
('5s-q6', '5s-1', '¿Cómo se define el quinto paso, "Shitsuke" (Disciplina / Mantener)?', '["Castigar a los operadores que no cumplan los reglamentos de limpieza", "Hacer de las 5S un hábito cotidiano y una parte natural del trabajo mediante la autodisciplina", "Llenar reportes diarios en una hoja de Excel", "Reorganizar el área de trabajo cada fin de año"]'::jsonb, 1, 10),
('5s-q7', '5s-1', '¿Por qué se agrega el componente "+1" (Seguridad - Safety) a las 5S en Flex?', '["Para mitigar actos y condiciones inseguras de forma transversal y prevenir accidentes", "Para aumentar el inventario de equipo de protección personal", "Para auditar la asistencia del personal médico", "Para dar bonos financieros mensuales"]'::jsonb, 0, 10),
('5s-q8', '5s-1', 'Al realizar la clasificación (Seiri), ¿qué se debe hacer con los objetos de uso poco frecuente o dudoso?', '["Colocarles una tarjeta roja y moverlos a un área de cuarentena para definir su destino final", "Tirarlos a la basura de inmediato sin preguntar a nadie", "Esconderlos debajo de la mesa de trabajo para que no los vea el auditor", "Dejarlos en el pasillo principal hasta que alguien los reclame"]'::jsonb, 0, 10),
('5s-q9', '5s-1', '¿Cuál es un ejemplo claro de control visual en Seiton (Ordenar)?', '["Un manual de 100 páginas sobre cómo usar las herramientas", "Sombras pintadas en el tablero de herramientas para identificar rápidamente si falta alguna", "Un correo electrónico enviado al supervisor al terminar la jornada", "Un cartel con la foto de la gerencia general de la empresa"]'::jsonb, 1, 10),
('5s-q10', '5s-1', '¿Quién es responsable de realizar y mantener las actividades de 5S + 1 en una línea de producción?', '["El departamento de limpieza externo contratado", "Únicamente el gerente de la planta de producción", "Absolutamente todos los miembros del equipo que trabajan en esa área", "El auditor de calidad que pasa una vez por semana"]'::jsonb, 2, 10)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    options = EXCLUDED.options,
    correct_option_index = EXCLUDED.correct_option_index,
    points = EXCLUDED.points;

-- 5 Porqués
INSERT INTO public.questions (id, exam_id, text, options, correct_option_index, points) VALUES
('fw-q1', '5-whys', '¿Cuál es el propósito primordial de la herramienta de los "5 Porqués"?', '["Encontrar al operador responsable del error en la línea", "Reemplazar la maquinaria que falla de manera constante", "Identificar la causa raíz de un problema para evitar su repetición mediante el análisis de relaciones causa-efecto", "Llenar el papeleo administrativo de incidentes"]'::jsonb, 2, 10),
('fw-q2', '5-whys', '¿Cuántas preguntas de "¿Por qué?" se deben realizar en esta herramienta?', '["Exactamente 5 preguntas en todos los casos obligatoriamente", "Las necesarias hasta llegar a la verdadera causa raíz, siendo típicamente cinco", "Siempre 3 preguntas para ser rápidos", "Ninguna, se deduce directamente de la primera respuesta"]'::jsonb, 1, 10),
('fw-q3', '5-whys', '¿Por qué se debe ir al Gemba (lugar real de trabajo) al realizar los 5 Porqués?', '["Para verificar los hechos y evidencias reales sin basarse en suposiciones o teorías", "Para hablar con la gerencia de planta", "Para detener la línea de producción", "Para limpiar la máquina que falló"]'::jsonb, 0, 10),
('fw-q4', '5-whys', '¿Qué es una relación de causa-efecto lógica en la cadena de los 5 Porqués?', '["Una secuencia que dependa enteramente de la intuición del supervisor", "Una conjetura rápida para cerrar el caso en el sistema", "Un supuesto que no requiera verificación de campo", "Una secuencia comprobable donde cada causa es suficiente para provocar el efecto inmediato superior"]'::jsonb, 3, 10),
('fw-q5', '5-whys', '¿Qué se debe hacer una vez identificada la causa raíz con esta técnica?', '["Implementar acciones correctivas para eliminar la causa y preventivas para evitar que ocurra en áreas similares", "Cambiar de puesto al operador responsable del error", "Aplicar una sanción administrativa", "Reiniciar la máquina y seguir produciendo de la misma manera"]'::jsonb, 0, 10),
('fw-q6', '5-whys', 'Si al preguntar el tercer "¿Por qué?" nos basamos en una suposición no verificable, ¿qué regla de oro se está rompiendo?', '["La regla de cambiar el operario", "La regla de Genchi Genbutsu: verificar los hechos físicamente en el Gemba", "El principio de velocidad SMED", "La auditoría trimestral corporativa"]'::jsonb, 1, 10),
('fw-q7', '5-whys', '¿Cuál de las siguientes es una causa raíz de tipo "sistema"?', '["Que el operador se sintiera cansado durante el turno", "Que hubiera polvo en la estación de ensamble", "Falta de un estándar de mantenimiento preventivo definido en el sistema de gestión", "Que la herramienta estuviera gastada"]'::jsonb, 2, 10),
('fw-q8', '5-whys', '¿Qué diferencia a una acción correctiva de una acción preventiva?', '["La correctiva elimina la causa raíz en el proceso actual; la preventiva la extiende a otros equipos o procesos similares", "La correctiva es más costosa que la preventiva", "La correctiva es opcional y la preventiva es obligatoria", "No existe ninguna diferencia práctica entre ambas"]'::jsonb, 0, 10),
('fw-q9', '5-whys', '¿Cuál es un error común al aplicar los 5 Porqués?', '["Verificar la causa física en el Gemba", "Involucrar a los operarios en la sesión de análisis", "Echarle la culpa al error humano del operador en lugar de buscar la falla del sistema o proceso", "Tomar datos numéricos del tiempo de paro de la máquina"]'::jsonb, 2, 10),
('fw-q10', '5-whys', '¿Cómo sabemos que hemos llegado a la causa raíz de un problema?', '["Cuando el supervisor decide dar por terminado el reporte", "Cuando se han cumplido exactamente 5 porqués en la hoja", "Cuando el operador promete no volver a cometer el error", "Cuando la eliminación del factor identificado impide de manera lógica que el problema vuelva a ocurrir"]'::jsonb, 3, 10)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    options = EXCLUDED.options,
    correct_option_index = EXCLUDED.correct_option_index,
    points = EXCLUDED.points;

-- 7 Ways
INSERT INTO public.questions (id, exam_id, text, options, correct_option_index, points) VALUES
('7w-q1', '7-ways', '¿Qué busca promover principalmente la herramienta "7 Ways"?', '["Resolver el problema en 7 minutos", "Forzar al equipo a generar al menos 7 ideas de solución alternativas y creativas ante un problema", "Limitar las ideas del equipo a 1 sola solución obvia", "Tener 7 operadores en cada reunión Kaizen"]'::jsonb, 1, 10),
('7w-q2', '7-ways', '¿Por qué es importante generar múltiples alternativas de solución en lugar de elegir la primera idea?', '["Porque la primera idea suele ser la más obvia pero no necesariamente la más eficiente, económica o segura", "Para retrasar el inicio de las tareas correctivas", "Para llenar la documentación del sistema de calidad", "Porque la primera idea siempre es incorrecta"]'::jsonb, 0, 10),
('7w-q3', '7-ways', 'Al evaluar las alternativas en la matriz de "7 Ways", ¿cuáles son los criterios típicos de análisis?', '["La opinión de la gerencia de planta únicamente", "El color de los componentes que se van a fabricar", "Costo, tiempo de implementación, impacto en calidad, factibilidad y seguridad", "Ninguno, se escoge la idea de forma aleatoria"]'::jsonb, 2, 10),
('7w-q4', '7-ways', '¿Qué técnica de facilitación se sugiere para la primera fase de los 7 Ways?', '["Discusión crítica uno a uno", "Llenar cuestionarios individuales en la computadora", "Hacer una encuesta con clientes externos", "Lluvia de ideas (Brainstorming) libre y estructurada, sin juzgar ni descartar ideas inicialmente"]'::jsonb, 3, 10),
('7w-q5', '7-ways', '¿Qué se hace si algunas de las 7 soluciones propuestas no son factibles de implementar por sí solas?', '["Se pueden combinar elementos de varias propuestas para diseñar una solución superadora y robusta", "Se descarta todo el proyecto y se inicia desde cero", "Se elige la más sencilla sin importar su efectividad", "Se implementan todas las 7 propuestas a la vez"]'::jsonb, 0, 10),
('7w-q6', '7-ways', 'En la matriz de selección de los 7 Ways, ¿cuál de los siguientes criterios tiene prioridad absoluta sobre los demás?', '["El costo total de adquisición de las herramientas", "La seguridad e higiene del personal (mitigación de riesgos)", "El tiempo de entrega estimado de los proveedores", "La estética del diseño de la estación de trabajo"]'::jsonb, 1, 10),
('7w-q7', '7-ways', '¿Quiénes deben participar en el taller de generación de los 7 Ways?', '["Exclusivamente los gerentes de departamento", "Solo el auditor de calidad externo", "Un equipo multidisciplinario que incluya ingenieros, supervisores y operadores del área afectada", "Cualquier persona que no pertenezca al área del problema"]'::jsonb, 2, 10),
('7w-q8', '7-ways', '¿Qué entregable o resultado final se genera después de la selección de la mejor alternativa de los 7 Ways?', '["Una presentación de PowerPoint con fotos decorativas", "Una solicitud de incremento de presupuesto general", "Una felicitación verbal al líder del área", "Un plan de acción Kaizen con tareas, responsables y fechas límite de implementación"]'::jsonb, 3, 10),
('7w-q9', '7-ways', '¿Cuál es el beneficio de clasificar las ideas en al menos 7 enfoques diferentes?', '["Romper paradigmas mentales y forzar la exploración de soluciones mecánicas, digitales, logísticas y humanas", "Cumplir con las normas ISO de forma obligatoria", "Hacer que la junta de trabajo dure más tiempo", "Aumentar el número de patentes registradas"]'::jsonb, 0, 10),
('7w-q10', '7-ways', '¿Qué significa que una alternativa seleccionada de los 7 Ways se considere una "acción preventiva"?', '["Que requiere una aprobación gerencial compleja antes de usarse", "Que se implementa después de que la línea falló por segunda vez", "Que su diseño busca evitar que el modo de falla ocurra por primera vez o se propague a áreas similares", "Que es una contramedida provisional de corta duración"]'::jsonb, 2, 10)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    options = EXCLUDED.options,
    correct_option_index = EXCLUDED.correct_option_index,
    points = EXCLUDED.points;

-- SGA Guide
INSERT INTO public.questions (id, exam_id, text, options, correct_option_index, points) VALUES
('sg-q1', 'sga-guide', '¿Qué significan las siglas SGA en el contexto de mejora continua de Flex?', '["Sistema de Gestión de Almacenes", "Small Group Activities (Actividades de Grupos Pequeños)", "Soporte Gráfico de Aprendizaje", "Seguimiento General de Acciones"]'::jsonb, 1, 10),
('sg-q2', 'sga-guide', '¿Quiénes conforman principalmente los miembros de un equipo SGA?', '["El personal operativo y técnicos directos (DL) del área de trabajo afectada", "Exclusivamente los directores y gerentes de la planta", "El equipo corporativo de recursos humanos", "Los consultores externos contratados por la empresa"]'::jsonb, 0, 10),
('sg-q3', 'sga-guide', '¿Cuál es el rol del Facilitador en el desarrollo de un proyecto SGA?', '["Realizar las tareas del Kaizen en su propia oficina", "Tomar decisiones autoritarias por encima del equipo", "Guiar al equipo en la metodología Lean, asesorar en herramientas y facilitar la resolución de obstáculos", "Tomar el tiempo de asistencia de las reuniones únicamente"]'::jsonb, 2, 10),
('sg-q4', 'sga-guide', '¿Quién tiene el rol de coordinar las reuniones del SGA y reportar los avances al sponsor?', '["El auditor de calidad de la línea de ensamble", "El gerente general de la división", "El supervisor de mantenimiento", "El Líder del Equipo SGA, elegido democráticamente por los miembros operativos"]'::jsonb, 3, 10),
('sg-q5', 'sga-guide', '¿Cuál de los siguientes es el primer paso metodológico en un proyecto SGA?', '["Seleccionar el tema y definir el problema con claridad", "Implementar las contramedidas en la línea de ensamble", "Presentar el reporte final a la gerencia de planta", "Estandarizar el proceso en las demás estaciones"]'::jsonb, 0, 10),
('sg-q6', 'sga-guide', 'En la metodología SGA, ¿por qué es crítico entender el "estado actual" antes de implementar contramedidas?', '["Para justificar el tiempo extra gastado en las juntas", "Para cuantificar el problema con datos precisos y establecer una línea base de comparación", "Para reportar scrap acumulado del mes anterior", "Para cambiar el orden de las máquinas en la celda de trabajo"]'::jsonb, 1, 10),
('sg-q7', 'sga-guide', '¿Qué herramienta se utiliza típicamente en SGA para descubrir la causa raíz de una anomalía?', '["Una encuesta telefónica con los clientes", "Auditoría visual de 5S en toda la planta", "El análisis de los 5 Porqués y los diagramas de Ishikawa", "La reubicación de los operarios de la celda"]'::jsonb, 2, 10),
('sg-q8', 'sga-guide', 'Una vez implementadas las contramedidas y lograda la mejora, ¿cuál es el siguiente paso crítico en el ciclo SGA?', '["Eliminar el equipo de trabajo y disolver el grupo", "Iniciar una nueva lluvia de ideas al día siguiente", "Incrementar la velocidad de las líneas de producción", "Estandarizar el nuevo método mediante ayudas visuales y hojas de operación estándar para evitar retrocesos"]'::jsonb, 3, 10),
('sg-q9', 'sga-guide', '¿Cómo se fomenta la cultura de mejora continua y motivación en los proyectos SGA en Flex?', '["Mediante el reconocimiento de los equipos en foros de presentación corporativos ante la gerencia", "Mediante auditorías sorpresa y castigos a los equipos lentos", "Aumentando la velocidad de las bandas de producción", "Manteniendo las ideas en secreto para que otras líneas no las copien"]'::jsonb, 0, 10),
('sg-q10', 'sga-guide', '¿Cuál es la duración típica de un proyecto o ciclo de mejora de un equipo SGA?', '["Exactamente un año de desarrollo continuo", "Menos de dos horas en una sola junta de trabajo", "De 4 a 12 semanas de reuniones periódicas y experimentación rápida en piso", "Diez minutos antes del inicio del turno de trabajo"]'::jsonb, 2, 10)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    options = EXCLUDED.options,
    correct_option_index = EXCLUDED.correct_option_index,
    points = EXCLUDED.points;

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

