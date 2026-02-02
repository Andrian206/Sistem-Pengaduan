-- =====================================================
-- FIX RPC FUNCTIONS - Jalankan di Supabase SQL Editor
-- =====================================================
-- Copy semua isi file ini dan jalankan di:
-- Supabase Dashboard > SQL Editor > New Query > Run
-- =====================================================

-- 1. HAPUS SEMUA FUNCTION LAMA (berbagai signature)
-- =====================================================
DROP FUNCTION IF EXISTS get_user_from_session(TEXT);
DROP FUNCTION IF EXISTS update_ticket_status(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS update_ticket_status(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_ticket_status;
DROP FUNCTION IF EXISTS delete_ticket(TEXT, UUID);
DROP FUNCTION IF EXISTS delete_ticket(TEXT, TEXT);
DROP FUNCTION IF EXISTS delete_ticket;
DROP FUNCTION IF EXISTS add_ticket_response(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS add_ticket_response(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS delete_own_ticket(TEXT, UUID);
DROP FUNCTION IF EXISTS delete_own_ticket(TEXT, TEXT);

-- 2. BUAT VIEW PUBLIC_USERS (sembunyikan password)
-- =====================================================
DROP VIEW IF EXISTS public_users;
CREATE OR REPLACE VIEW public_users AS
SELECT 
  id,
  email,
  role,
  full_name,
  blok_rumah,
  phone,
  created_at
FROM users;

GRANT SELECT ON public_users TO anon, authenticated;

-- 3. HELPER FUNCTION: Get User from Session Token
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_from_session(p_token TEXT)
RETURNS TABLE (
  user_id UUID,
  user_role TEXT,
  user_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.user_id,
    u.role::TEXT,
    u.full_name
  FROM sessions s
  JOIN users u ON u.id = s.user_id
  WHERE s.token = p_token 
    AND s.expires_at > NOW();
END;
$$;

-- 4. UPDATE TICKET STATUS (Admin & Ketua RT)
-- =====================================================
CREATE OR REPLACE FUNCTION update_ticket_status(
  p_token TEXT,
  p_ticket_id TEXT,  -- TEXT agar bisa menerima UUID string dari JS
  p_new_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_ticket_uuid UUID;
  v_valid_statuses TEXT[] := ARRAY['PENDING', 'PROSES', 'SELESAI'];
BEGIN
  -- Convert ticket_id to UUID
  BEGIN
    v_ticket_uuid := p_ticket_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'ID ticket tidak valid');
  END;

  -- Validasi token dan ambil user info
  SELECT user_id, user_role INTO v_user_id, v_role
  FROM get_user_from_session(p_token);
  
  -- Cek session valid
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Session tidak valid atau sudah expired'
    );
  END IF;
  
  -- Cek role permission (hanya admin dan ketua_rt)
  IF v_role NOT IN ('admin', 'ketua_rt') THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Anda tidak memiliki akses untuk mengubah status'
    );
  END IF;
  
  -- Validasi status value
  IF NOT (p_new_status = ANY(v_valid_statuses)) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Status tidak valid. Gunakan: PENDING, PROSES, atau SELESAI'
    );
  END IF;
  
  -- Cek apakah ticket exists
  IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = v_ticket_uuid) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Ticket tidak ditemukan'
    );
  END IF;
  
  -- Update ticket
  UPDATE tickets 
  SET 
    status = p_new_status, 
    updated_at = NOW()
  WHERE id = v_ticket_uuid;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Status berhasil diperbarui'
  );
END;
$$;

-- 5. DELETE TICKET (Admin Only)
-- =====================================================
CREATE OR REPLACE FUNCTION delete_ticket(
  p_token TEXT,
  p_ticket_id TEXT  -- TEXT agar bisa menerima UUID string dari JS
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_ticket_uuid UUID;
  v_ticket_title TEXT;
BEGIN
  -- Convert ticket_id to UUID
  BEGIN
    v_ticket_uuid := p_ticket_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'ID ticket tidak valid');
  END;

  -- Validasi token dan ambil user info
  SELECT user_id, user_role INTO v_user_id, v_role
  FROM get_user_from_session(p_token);
  
  -- Cek session valid
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Session tidak valid atau sudah expired'
    );
  END IF;
  
  -- Cek role permission (hanya admin)
  IF v_role != 'admin' THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Hanya admin yang dapat menghapus pengaduan'
    );
  END IF;
  
  -- Ambil info ticket sebelum delete
  SELECT title INTO v_ticket_title FROM tickets WHERE id = v_ticket_uuid;
  
  -- Cek apakah ticket exists
  IF v_ticket_title IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Ticket tidak ditemukan'
    );
  END IF;
  
  -- Delete ticket
  DELETE FROM tickets WHERE id = v_ticket_uuid;
  
  RETURN json_build_object(
    'success', true, 
    'message', format('Pengaduan "%s" berhasil dihapus', v_ticket_title)
  );
END;
$$;

-- 6. GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION get_user_from_session(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_ticket_status(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_ticket(TEXT, TEXT) TO anon, authenticated;

-- 7. ENABLE RLS & CREATE POLICIES
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "allow_all_users" ON users;
DROP POLICY IF EXISTS "allow_all_tickets" ON tickets;
DROP POLICY IF EXISTS "allow_all_sessions" ON sessions;
DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_insert_all" ON users;
DROP POLICY IF EXISTS "tickets_select_all" ON tickets;
DROP POLICY IF EXISTS "tickets_insert_all" ON tickets;
DROP POLICY IF EXISTS "sessions_all_operations" ON sessions;

-- Create new policies
CREATE POLICY "users_select_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_all" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "tickets_select_all" ON tickets FOR SELECT USING (true);
CREATE POLICY "tickets_insert_all" ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "sessions_all_operations" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- SELESAI! Refresh halaman admin dan coba lagi
-- =====================================================
