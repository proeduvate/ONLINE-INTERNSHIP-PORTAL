-- ==============================================================================
-- SUPABASE PRODUCTION SCHEMA MIGRATION: AUTH.USERS LINKING & STORAGE BUCKET
-- ==============================================================================

-- 1. Create SQL Trigger Function to auto-sync new auth.users into public.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'intern'),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach Trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 3. Create Supabase Storage Bucket for Certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Public Read Access Policy for certificates bucket
CREATE POLICY "Public Read Access for Certificates Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');

-- 5. Enable Service Role Upload Policy for certificates bucket
CREATE POLICY "Service Role Upload for Certificates Bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'certificates');

