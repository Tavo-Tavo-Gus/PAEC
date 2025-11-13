/*
  # Initial Schema Setup

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `name` (text)
      - `age` (integer)
      - `grade` (text)
      - `diagnosis` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `medications`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `name` (text)
      - `dosage` (text)
      - `frequency` (text)
      - `next_dose` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `support_plans`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `support_needs` (text[])
      - `skills` (text[])
      - `triggers` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `events`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `title` (text)
      - `type` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  grade text NOT NULL,
  diagnosis text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  next_dose timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create support_plans table
CREATE TABLE IF NOT EXISTS support_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  support_needs text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  triggers text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read access" ON students
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON medications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON support_plans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON events
  FOR SELECT TO authenticated USING (true);

-- Create policies for insert, update, delete
CREATE POLICY "Allow authenticated insert" ON students
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON students
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON students
  FOR DELETE TO authenticated USING (true);

-- Repeat for other tables
CREATE POLICY "Allow authenticated insert" ON medications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON medications
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON medications
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON support_plans
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON support_plans
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON support_plans
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON events
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete" ON events
  FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_support_plans_updated_at
  BEFORE UPDATE ON support_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();