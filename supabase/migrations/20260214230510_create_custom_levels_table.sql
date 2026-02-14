/*
  # Create custom levels table

  1. New Tables
    - `custom_levels`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `subtitle` (text)
      - `platforms` (jsonb, array of platform objects)
      - `walls` (jsonb, array of wall objects)
      - `playerStart` (jsonb, spawn point 1)
      - `playerStart2` (jsonb, spawn point 2)
      - `flag` (jsonb, flag position)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `custom_levels` table
    - Allow public read access
    - (Auth would be needed for write access in production)
*/

CREATE TABLE IF NOT EXISTS custom_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subtitle text DEFAULT '',
  platforms jsonb NOT NULL DEFAULT '[]'::jsonb,
  walls jsonb NOT NULL DEFAULT '[]'::jsonb,
  "playerStart" jsonb NOT NULL DEFAULT '{"x": 40, "y": 520}'::jsonb,
  "playerStart2" jsonb NOT NULL DEFAULT '{"x": 50, "y": 100}'::jsonb,
  flag jsonb NOT NULL DEFAULT '{"x": 870, "y": 150}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE custom_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Custom levels are readable by everyone"
  ON custom_levels
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Custom levels can be inserted by anyone"
  ON custom_levels
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Custom levels can be updated by anyone"
  ON custom_levels
  FOR UPDATE
  TO public
  WITH CHECK (true);

CREATE POLICY "Custom levels can be deleted by anyone"
  ON custom_levels
  FOR DELETE
  TO public
  USING (true);
