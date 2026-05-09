-- ================================================================
-- COMAGRO EVENTOS — Esquema SQL Completo para Supabase / PostgreSQL
-- Ejecutar en: Supabase > SQL Editor
-- ================================================================

-- 1. TABLA PROFILES (extiende auth.users)
-- ================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT        UNIQUE,
  role        TEXT        DEFAULT 'staff'
              CHECK (role IN ('admin','staff','scanner')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-crear perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. TABLA EVENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS events (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT        UNIQUE NOT NULL,
  name                  TEXT        NOT NULL,
  type                  TEXT        DEFAULT 'evento'
                        CHECK (type IN ('capacitacion','evento','lanzamiento','feria','otro')),
  description           TEXT,
  date                  DATE        NOT NULL,
  time                  TIME,
  location              TEXT,
  banner_url            TEXT,
  max_capacity          INTEGER     DEFAULT 100 CHECK (max_capacity > 0),
  registration_deadline DATE,
  status                TEXT        DEFAULT 'borrador'
                        CHECK (status IN ('borrador','activo','finalizado')),
  created_by            UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_updated_at ON events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();


-- 3. TABLA REGISTRATIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS registrations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id    TEXT        UNIQUE NOT NULL,           -- 6 chars base36 mayúscula
  event_id    UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  first_name  TEXT        NOT NULL,
  last_name   TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  phone       TEXT,
  company     TEXT,
  status      TEXT        DEFAULT 'preregistro'
              CHECK (status IN ('preregistro','confirmado','presente','ausente')),
  attended_at TIMESTAMPTZ,
  attended_by UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  ip_hash     TEXT,                                  -- Hash SHA-256 de IP (anti-spam)
  UNIQUE (event_id, email)                           -- 1 correo por evento
);

DROP TRIGGER IF EXISTS registrations_updated_at ON registrations;
-- No updated_at trigger needed (we track status changes directly)


-- 4. VISTA event_stats
-- ================================================================
CREATE OR REPLACE VIEW event_stats AS
SELECT
  e.id,
  e.name,
  e.slug,
  e.type,
  e.date,
  e.time,
  e.location,
  e.status,
  e.max_capacity,
  e.created_at,
  COUNT(r.id)                                                              AS total_registered,
  COUNT(CASE WHEN r.status = 'presente'   THEN 1 END)                     AS total_attended,
  COUNT(CASE WHEN r.status = 'preregistro' THEN 1 END)                    AS total_preregistro,
  COUNT(CASE WHEN r.status = 'confirmado'  THEN 1 END)                    AS total_confirmado,
  COUNT(CASE WHEN r.status = 'ausente'     THEN 1 END)                    AS total_ausente,
  ROUND(
    COUNT(CASE WHEN r.status = 'presente' THEN 1 END)::NUMERIC /
    NULLIF(COUNT(r.id), 0) * 100, 1
  )                                                                        AS attendance_rate,
  (e.max_capacity - COUNT(r.id))                                           AS spots_remaining
FROM events e
LEFT JOIN registrations r ON r.event_id = e.id
GROUP BY e.id;


-- 5. ROW LEVEL SECURITY (RLS)
-- ================================================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins see all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);


-- EVENTS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read events"
  ON events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','staff','scanner'))
  );

CREATE POLICY "Staff can insert events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','staff'))
  );

CREATE POLICY "Staff can update events"
  ON events FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','staff'))
  );

CREATE POLICY "Admin can delete events"
  ON events FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );


-- REGISTRATIONS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Público puede insertar (formulario de registro sin auth)
CREATE POLICY "Public can register"
  ON registrations FOR INSERT
  WITH CHECK (true);

-- Staff y scanner pueden leer
CREATE POLICY "Staff can read registrations"
  ON registrations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','staff','scanner'))
  );

-- Staff puede editar (cambiar estado, check-in)
CREATE POLICY "Staff can update registrations"
  ON registrations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','staff','scanner'))
  );

-- Solo admin puede borrar
CREATE POLICY "Admin can delete registrations"
  ON registrations FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );


-- 6. ÍNDICES para performance
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email    ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_status   ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_short_id ON registrations(short_id);
CREATE INDEX IF NOT EXISTS idx_events_slug            ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status          ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date            ON events(date);


-- 7. DATOS INICIALES (opcional - crear primer admin manualmente)
-- ================================================================
-- Después de crear tu usuario en Supabase Auth (signup o dashboard),
-- ejecutar esto reemplazando el EMAIL con tu correo:
--
-- UPDATE profiles SET role = 'admin', full_name = 'Administrador'
-- WHERE email = 'tu-email@comagro.com.py';
