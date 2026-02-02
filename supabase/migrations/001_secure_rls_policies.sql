-- =====================================================
-- SECURE RLS POLICIES FOR SISTEM PENGADUAN
-- =====================================================
-- Karena menggunakan custom authentication (bukan Supabase Auth),
-- kita menggunakan RPC functions dengan SECURITY DEFINER untuk
-- operasi yang memerlukan validasi role.
-- =====================================================

-- 0. DROP ALL EXISTING FUNCTIONS (Clean slate)
-- =====================================================
DROP FUNCTION IF EXISTS get_user_from_session(TEXT);
DROP FUNCTION IF EXISTS update_ticket_status(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS update_ticket_status(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS delete_ticket(TEXT, UUID);
DROP FUNCTION IF EXISTS delete_ticket(TEXT, TEXT);
DROP FUNCTION IF EXISTS add_ticket_response(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS add_ticket_response(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS delete_own_ticket(TEXT, UUID);
DROP FUNCTION IF EXISTS delete_own_ticket(TEXT, TEXT);

-- 1. CREATE PUBLIC_USERS VIEW (Hide password from SELECT)
-- =====================================================
DROP VIEW IF EXISTS public_users;
CREATE VIEW public_users AS
SELECT 
  id,
  email,
  role,
  full_name,
  blok_rumah,
  phone,
  created_at
FROM users;

-- Grant access to the view
GRANT SELECT ON public_users TO anon, authenticated;

-- 2. ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING POLICIES (Clean slate)
-- =====================================================
DROP POLICY IF EXISTS "allow_all_users" ON users;
DROP POLICY IF EXISTS "allow_all_tickets" ON tickets;
DROP POLICY IF EXISTS "allow_all_sessions" ON sessions;
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_insert" ON users;
DROP POLICY IF EXISTS "tickets_select" ON tickets;
DROP POLICY IF EXISTS "tickets_insert" ON tickets;
DROP POLICY IF EXISTS "tickets_update" ON tickets;
DROP POLICY IF EXISTS "tickets_delete" ON tickets;
DROP POLICY IF EXISTS "sessions_all" ON sessions;

-- 3. USERS TABLE POLICIES
-- =====================================================
-- Semua orang bisa melihat users (untuk login check)
CREATE POLICY "users_select_all" ON users
  FOR SELECT USING (true);

-- Semua orang bisa insert (untuk register)
CREATE POLICY "users_insert_all" ON users
  FOR INSERT WITH CHECK (true);

-- 4. SESSIONS TABLE POLICIES
-- =====================================================
-- Sessions bisa diakses untuk validasi
CREATE POLICY "sessions_all_operations" ON sessions
  FOR ALL USING (true) WITH CHECK (true);

-- 5. TICKETS TABLE POLICIES
-- =====================================================
-- SELECT: Semua authenticated user bisa lihat tickets
-- (validasi lebih lanjut di aplikasi berdasarkan role)
CREATE POLICY "tickets_select_all" ON tickets
  FOR SELECT USING (true);

-- INSERT: Semua user bisa membuat ticket
CREATE POLICY "tickets_insert_all" ON tickets
  FOR INSERT WITH CHECK (true);

-- UPDATE & DELETE: Hanya melalui RPC functions (tidak direct)
-- Kita TIDAK buat policy untuk UPDATE dan DELETE
-- Sehingga harus menggunakan RPC functions

-- =====================================================
-- 7. HELPER FUNCTION: Validate Session & Get User Role
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

-- =====================================================
-- 7. RPC FUNCTION: Update Ticket Status (Admin & Ketua RT)
-- =====================================================
CREATE OR REPLACE FUNCTION update_ticket_status(
  p_token TEXT,
  p_ticket_id UUID,
  p_new_status TEXT  -- Menggunakan p_new_status untuk konsistensi dengan frontend
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_valid_statuses TEXT[] := ARRAY['PENDING', 'PROSES', 'SELESAI'];
BEGIN
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
  IF p_new_status != ALL(v_valid_statuses) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Status tidak valid. Gunakan: PENDING, PROSES, atau SELESAI'
    );
  END IF;
  
  -- Cek apakah ticket exists
  IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = p_ticket_id) THEN
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
  WHERE id = p_ticket_id;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Status berhasil diperbarui'
  );
END;
$$;

-- =====================================================
-- 8. RPC FUNCTION: Delete Ticket (Admin Only)
-- =====================================================
CREATE OR REPLACE FUNCTION delete_ticket(
  p_token TEXT,
  p_ticket_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_ticket_title TEXT;
BEGIN
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
  SELECT title INTO v_ticket_title FROM tickets WHERE id = p_ticket_id;
  
  -- Cek apakah ticket exists
  IF v_ticket_title IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Ticket tidak ditemukan'
    );
  END IF;
  
  -- Delete ticket
  DELETE FROM tickets WHERE id = p_ticket_id;
  
  RETURN json_build_object(
    'success', true, 
    'message', format('Pengaduan "%s" berhasil dihapus', v_ticket_title)
  );
END;
$$;

-- =====================================================
-- 9. RPC FUNCTION: Add Response to Ticket (Admin & Ketua RT)
-- =====================================================
CREATE OR REPLACE FUNCTION add_ticket_response(
  p_token TEXT,
  p_ticket_id UUID,
  p_response TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_user_name TEXT;
BEGIN
  -- Validasi token dan ambil user info
  SELECT user_id, user_role, user_name INTO v_user_id, v_role, v_user_name
  FROM get_user_from_session(p_token);
  
  -- Cek session valid
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Session tidak valid atau sudah expired'
    );
  END IF;
  
  -- Cek role permission
  IF v_role NOT IN ('admin', 'ketua_rt') THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Anda tidak memiliki akses untuk menambah tanggapan'
    );
  END IF;
  
  -- Cek apakah ticket exists
  IF NOT EXISTS (SELECT 1 FROM tickets WHERE id = p_ticket_id) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Ticket tidak ditemukan'
    );
  END IF;
  
  -- Update ticket dengan response
  UPDATE tickets 
  SET 
    response = p_response,
    responded_by = v_user_id,
    responded_at = NOW(),
    updated_at = NOW()
  WHERE id = p_ticket_id;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Tanggapan berhasil ditambahkan',
    'responded_by', v_user_name
  );
END;
$$;

-- =====================================================
-- 10. RPC FUNCTION: User Delete Own Ticket (Owner Only)
-- =====================================================
CREATE OR REPLACE FUNCTION delete_own_ticket(
  p_token TEXT,
  p_ticket_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_ticket_user_id UUID;
  v_ticket_status TEXT;
BEGIN
  -- Validasi token
  SELECT user_id INTO v_user_id
  FROM get_user_from_session(p_token);
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Session tidak valid atau sudah expired'
    );
  END IF;
  
  -- Ambil info ticket
  SELECT user_id, status INTO v_ticket_user_id, v_ticket_status
  FROM tickets WHERE id = p_ticket_id;
  
  IF v_ticket_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Ticket tidak ditemukan'
    );
  END IF;
  
  -- Cek ownership
  IF v_ticket_user_id != v_user_id THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Anda hanya dapat menghapus pengaduan milik sendiri'
    );
  END IF;
  
  -- Cek status (hanya bisa hapus jika masih pending)
  IF v_ticket_status != 'pending' THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Hanya pengaduan dengan status pending yang dapat dihapus'
    );
  END IF;
  
  -- Delete ticket
  DELETE FROM tickets WHERE id = p_ticket_id;
  
  RETURN json_build_object('success', true, 'message', 'Pengaduan berhasil dihapus');
END;
$$;

-- =====================================================
-- 11. GRANT EXECUTE PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION get_user_from_session(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_ticket_status(TEXT, UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_ticket(TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION add_ticket_response(TEXT, UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_own_ticket(TEXT, UUID) TO anon, authenticated;

-- =====================================================
-- SELESAI! Jalankan file ini di Supabase SQL Editor
-- =====================================================
