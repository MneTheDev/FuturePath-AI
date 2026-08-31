-- ============================================================
-- FuturePath Eswatini – Complete Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT UNIQUE NOT NULL,
  full_name    TEXT NOT NULL,
  phone        TEXT,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role  ON profiles(role);

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  company          TEXT NOT NULL,
  company_logo     TEXT,
  location         TEXT NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('FULL-TIME','INTERNSHIP','REMOTE','PART-TIME','CONTRACT')),
  category         TEXT NOT NULL,
  salary           TEXT,
  experience_level TEXT,
  description      TEXT NOT NULL,
  requirements     TEXT[] NOT NULL DEFAULT '{}',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_by       UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_type     ON jobs(type);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_active   ON jobs(is_active);
CREATE INDEX idx_jobs_title_trgm ON jobs USING GIN (title gin_trgm_ops);

-- ============================================================
-- INTERNSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS internships (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  organization      TEXT NOT NULL,
  organization_logo TEXT,
  location          TEXT NOT NULL,
  category          TEXT NOT NULL,
  stipend           TEXT,
  duration          TEXT,
  description       TEXT NOT NULL,
  requirements      TEXT[] NOT NULL DEFAULT '{}',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_by        UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_internships_category ON internships(category);
CREATE INDEX idx_internships_active   ON internships(is_active);

-- ============================================================
-- APPLICATIONS (jobs + internships)
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id         UUID REFERENCES jobs(id) ON DELETE SET NULL,
  internship_id  UUID REFERENCES internships(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','reviewed','shortlisted','rejected','accepted')),
  cover_letter   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT application_target CHECK (
    (job_id IS NOT NULL AND internship_id IS NULL) OR
    (job_id IS NULL AND internship_id IS NOT NULL)
  )
);

CREATE INDEX idx_applications_user   ON applications(user_id);
CREATE INDEX idx_applications_job    ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ============================================================
-- SAVED JOBS
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_jobs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, job_id)
);

CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL,
  level         TEXT NOT NULL CHECK (level IN ('Beginner','Intermediate','Advanced')),
  duration_hours NUMERIC(5,1) NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_category  ON courses(category);
CREATE INDEX idx_courses_published ON courses(is_published);

-- ============================================================
-- COURSE MODULES (lessons)
-- ============================================================
CREATE TABLE IF NOT EXISTS course_modules (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  order_index      INTEGER NOT NULL,
  video_url        TEXT,
  content          TEXT,
  duration_minutes INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modules_course ON course_modules(course_id);

-- ============================================================
-- QUIZZES
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id       UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  pass_percentage INTEGER NOT NULL DEFAULT 60,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- QUIZ QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id       UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  options       TEXT[] NOT NULL,
  correct_index INTEGER NOT NULL,
  order_index   INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_quiz ON quiz_questions(quiz_id);

-- ============================================================
-- QUIZ ATTEMPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id    UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score      INTEGER NOT NULL,
  passed     BOOLEAN NOT NULL,
  answers    INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_attempts_quiz ON quiz_attempts(quiz_id);

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_uid TEXT UNIQUE NOT NULL,
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_revoked      BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_at      TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);

CREATE INDEX idx_certs_user       ON certificates(user_id);
CREATE INDEX idx_certs_uid        ON certificates(certificate_uid);
CREATE INDEX idx_certs_revoked    ON certificates(is_revoked);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('job','internship','course','certificate','system')),
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifs_user    ON notifications(user_id);
CREATE INDEX idx_notifs_read    ON notifications(is_read);
CREATE INDEX idx_notifs_created ON notifications(created_at DESC);

-- ============================================================
-- USER PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id             UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  lessons_completed     INTEGER NOT NULL DEFAULT 0,
  total_lessons         INTEGER NOT NULL DEFAULT 0,
  last_accessed         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  streak_days           INTEGER NOT NULL DEFAULT 0,
  total_hours           NUMERIC(6,1) NOT NULL DEFAULT 0,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX idx_progress_user   ON user_progress(user_id);
CREATE INDEX idx_progress_course ON user_progress(course_id);

-- ============================================================
-- CV DATA (stored as JSONB)
-- ============================================================
CREATE TABLE IF NOT EXISTS cv_data (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS – updated_at auto-stamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles','jobs','internships','applications',
    'courses','user_progress','cv_data'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %s;
       CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships    ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_data        ENABLE ROW LEVEL SECURITY;

-- Profiles: user sees own, admin sees all
CREATE POLICY "profiles_own"   ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "profiles_admin" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Jobs / Internships: public read, admin write
CREATE POLICY "jobs_read"   ON jobs FOR SELECT USING (is_active = TRUE);
CREATE POLICY "jobs_admin"  ON jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "internships_read"  ON internships FOR SELECT USING (is_active = TRUE);
CREATE POLICY "internships_admin" ON internships FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Applications: user owns their own
CREATE POLICY "applications_own"   ON applications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "applications_admin" ON applications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Saved jobs: user owns their own
CREATE POLICY "saved_jobs_own" ON saved_jobs FOR ALL USING (auth.uid() = user_id);

-- Courses / modules / quizzes / questions: public read, admin write
CREATE POLICY "courses_read"  ON courses FOR SELECT USING (is_published = TRUE);
CREATE POLICY "courses_admin" ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "modules_read"  ON course_modules FOR SELECT USING (TRUE);
CREATE POLICY "quizzes_read"  ON quizzes FOR SELECT USING (TRUE);
CREATE POLICY "questions_read" ON quiz_questions FOR SELECT USING (TRUE);

-- Quiz attempts: user owns own
CREATE POLICY "attempts_own"   ON quiz_attempts FOR ALL USING (auth.uid() = user_id);

-- Certificates: user sees own, public can read for verification
CREATE POLICY "certs_own"    ON certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "certs_verify" ON certificates FOR SELECT USING (TRUE); -- for public verify
CREATE POLICY "certs_admin"  ON certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications: user sees own
CREATE POLICY "notifs_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- User progress: user sees own
CREATE POLICY "progress_own" ON user_progress FOR ALL USING (auth.uid() = user_id);

-- CV data: user sees own
CREATE POLICY "cv_own" ON cv_data FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- SEED: Admin user helper (replace with real user ID after signup)
-- ============================================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@futurepath.sz';
