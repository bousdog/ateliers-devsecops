/*
  # Create notes table for calendar application

  1. New Tables
    - `notes`
      - `id` (uuid, primary key) - Unique identifier for each note
      - `date` (date) - Date associated with the note
      - `title` (text) - Title of the note
      - `content` (text) - Content of the note
      - `created_at` (timestamptz) - Timestamp when note was created
      - `updated_at` (timestamptz) - Timestamp when note was last updated
      
  2. Security
    - Enable RLS on `notes` table
    - Add policies for public access (since no auth is implemented)
    
  3. Important Notes
    - This is a simple calendar app without authentication
    - All users can read and write notes
    - In production, you would want to add user authentication
*/

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster date queries
CREATE INDEX IF NOT EXISTS notes_date_idx ON notes(date);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access"
  ON notes
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access"
  ON notes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON notes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON notes
  FOR DELETE
  TO anon
  USING (true);