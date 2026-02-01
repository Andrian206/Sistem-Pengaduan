-- ====================================
-- SETUP DATABASE TABLES & SEED DATA
-- ====================================
-- Jalankan query ini di Supabase SQL Editor

-- 1. Buat tabel profiles jika belum ada
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'rt', 'ketua_rt', 'warga')),
  full_name TEXT,
  blok_rumah TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambahkan kolom email jika tabel sudah ada tapi belum punya kolom email
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT UNIQUE;
    -- Update email dari auth.users untuk data yang sudah ada
    UPDATE profiles p SET email = u.email 
    FROM auth.users u WHERE p.id = u.id AND p.email IS NULL;
    -- Set NOT NULL setelah data terisi
    ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;
  END IF;
END $$;

-- 2. Buat tabel tickets jika belum ada
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROSES', 'SELESAI')) DEFAULT 'PENDING',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Buat trigger untuk auto-create profile saat user register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, blok_rumah, phone)
  VALUES (
    NEW.id,
    NEW.email,
    'warga', -- default role
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'blok_rumah',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger jika sudah ada, lalu buat ulang
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies untuk profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
CREATE POLICY "Enable insert for service role" ON profiles
  FOR INSERT WITH CHECK (true);

-- 6. RLS Policies untuk tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all tickets" ON tickets;
CREATE POLICY "Admin can view all tickets" ON tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'rt', 'ketua_rt')
    )
  );

DROP POLICY IF EXISTS "Admin can update tickets" ON tickets;
CREATE POLICY "Admin can update tickets" ON tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'ketua_rt')
    )
  );

-- 7. Buat storage bucket untuk attachments (jika belum ada)
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Storage policy untuk attachments
DROP POLICY IF EXISTS "Anyone can upload attachments" ON storage.objects;
CREATE POLICY "Anyone can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Anyone can view attachments" ON storage.objects;
CREATE POLICY "Anyone can view attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'attachments');

-- ====================================
-- STEP SELANJUTNYA: BUAT USER MANUAL
-- ====================================
-- Baca file CREATE_USERS.md untuk panduan lengkap!
--
-- RINGKASAN SINGKAT:
-- 1. Buka Supabase Dashboard > Authentication > Users
-- 2. Klik "Add User" dan buat 4 user berikut:
--    - adminsapa123@gmail.com / adminsapa123 (centang Auto Confirm)
--    - pakrt123@gmail.com / pakrt123 (centang Auto Confirm)
--    - ketuart@gmail.com / ketuart123 (centang Auto Confirm)
--    - usersapa123@gmail.com / usersapa123 (centang Auto Confirm)
--
-- 3. Setelah semua user dibuat, jalankan query ini:

UPDATE profiles SET role = 'admin', full_name = 'Admin SapaIKMP' 
WHERE email = 'adminsapa123@gmail.com';

UPDATE profiles SET role = 'rt', full_name = 'Pak RT' 
WHERE email = 'pakrt123@gmail.com';

UPDATE profiles SET role = 'ketua_rt', full_name = 'Ketua RT' 
WHERE email = 'ketuart@gmail.com';

UPDATE profiles SET role = 'warga', full_name = 'User Warga' 
WHERE email = 'usersapa123@gmail.com';

-- Verifikasi semua user:
SELECT 
  u.email,
  u.email_confirmed_at,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY p.role;
