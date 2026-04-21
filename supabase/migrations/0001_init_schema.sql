-- =============================================================
-- Migration 0001: Initial schema for SLDt-next
-- Tables: projects, schemes, scheme_lines
-- =============================================================

-- -------------------------
-- 1. TABLE: projects
-- -------------------------
CREATE TABLE public.projects (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 255),
  customer    text        CHECK (char_length(customer) <= 255),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------
-- 2. TABLE: schemes
-- -------------------------
CREATE TABLE public.schemes (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id              uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Left group: РУ (распределительное устройство)
  device_name             text,
  shell_brand             text,
  shell_code              text,
  installation_method     text,
  protection_degree       text,
  installation_location   text,
  phases_count            smallint    CHECK (phases_count IN (1, 3)),
  network_type            text,
  power_supply_from       text,
  modules_count           integer     CHECK (modules_count > 0),

  -- Middle group: аппарат до ввода
  input_device_type       text,
  nominal_current         numeric(10,3),
  trip_setting            numeric(10,3),
  switching_capacity      numeric(10,3),
  protection_characteristic text,
  poles_count             smallint    CHECK (poles_count BETWEEN 1 AND 4),
  differential_current    numeric(10,3),
  designation             text,
  cable_info              text,

  -- Right group: итоговые нагрузки
  installed_power_kva     numeric(10,3),
  installed_power_current numeric(10,3),
  calculated_power_kva    numeric(10,3),
  calculated_current      numeric(10,3),
  demand_coefficient      numeric(5,4) CHECK (demand_coefficient BETWEEN 0 AND 1),
  current_phase_a         numeric(10,3),
  current_phase_b         numeric(10,3),
  current_phase_c         numeric(10,3),

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------
-- 3. TABLE: scheme_lines
-- -------------------------
CREATE TABLE public.scheme_lines (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id                   uuid        NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  line_order                  integer     NOT NULL DEFAULT 0,

  -- Column A: автоматический выключатель
  circuit_breaker_designation text,
  circuit_breaker_type        text,
  cb_nominal_current          numeric(10,3),
  cb_trip_setting             numeric(10,3),
  cb_protection_type          text,
  cb_differential_current     numeric(10,3),

  -- Columns B/C/D: кабель
  cable_designation           text,
  cable_brand                 text,
  cable_length                numeric(10,3),

  -- Columns E/F/G: труба/короб
  pipe_designation            text,
  pipe_length                 numeric(10,3),
  pipe_marking                text,

  -- Column H: мощность
  power_kw                    numeric(10,3),

  -- Columns I/J/K: токи по фазам
  phase_a_current             numeric(10,3),
  phase_b_current             numeric(10,3),
  phase_c_current             numeric(10,3),

  -- Column L: cos φ
  cos_phi                     numeric(4,3)  CHECK (cos_phi BETWEEN 0.01 AND 1.0),

  -- Columns M/N/O: электроприёмник
  load_name                   text,
  load_type                   text,
  load_drawing                text,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------
-- 4. Trigger: auto-update updated_at
-- -------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.schemes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.scheme_lines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -------------------------
-- 5. Indexes
-- -------------------------
CREATE INDEX ON public.schemes      (project_id);
CREATE INDEX ON public.scheme_lines (scheme_id, line_order);

-- -------------------------
-- 6. Row Level Security
-- -------------------------
ALTER TABLE public.projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_lines  ENABLE ROW LEVEL SECURITY;

-- projects: full access only to owner
CREATE POLICY "projects_own" ON public.projects
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- schemes: access via parent project owner
CREATE POLICY "schemes_own" ON public.schemes
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

-- scheme_lines: access via scheme → project owner
CREATE POLICY "scheme_lines_own" ON public.scheme_lines
  USING (
    EXISTS (
      SELECT 1 FROM public.schemes s
      JOIN public.projects p ON p.id = s.project_id
      WHERE s.id = scheme_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.schemes s
      JOIN public.projects p ON p.id = s.project_id
      WHERE s.id = scheme_id AND p.user_id = auth.uid()
    )
  );
