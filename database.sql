-- Run this SQL in your Supabase SQL Editor

CREATE TABLE app_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Optional: If you want to enable Row Level Security (RLS) but allow everyone to read/write 
-- (Since our API route handles the password check using the Service Role Key, RLS is bypassed by the API anyway)
-- So you don't strictly need to enable RLS if you only access the database through the Vercel API.

-- If you DO want to query directly from the frontend later without the API route:
-- ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations" ON app_data FOR ALL USING (true) WITH CHECK (true);
