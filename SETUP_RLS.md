# 🔐 Setup RLS (Row Level Security) yang Aman

## Masalah
Sistem menggunakan custom authentication (bukan Supabase Auth), sehingga RLS policies standar yang menggunakan `auth.uid()` tidak berfungsi.

## Solusi
Menggunakan **RPC Functions dengan SECURITY DEFINER** yang memvalidasi session token dan role user.

## Langkah Setup

### 1. Jalankan Migration SQL
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Pergi ke **SQL Editor**
4. Copy semua isi file `supabase/migrations/001_secure_rls_policies.sql`
5. Paste dan klik **Run**

### 2. Verifikasi Functions Terbuat
Setelah menjalankan SQL, verifikasi bahwa functions berikut ada di **Database > Functions**:
- `get_user_from_session(p_token)`
- `update_ticket_status(p_token, p_ticket_id, p_status)`
- `delete_ticket(p_token, p_ticket_id)`
- `add_ticket_response(p_token, p_ticket_id, p_response)`
- `delete_own_ticket(p_token, p_ticket_id)`

### 3. Test Fitur
- Login sebagai **admin** → Update status ✅, Delete ✅
- Login sebagai **ketua_rt** → Update status ✅, Delete ❌
- Login sebagai **warga** → Update status ❌, Delete ❌ (hanya bisa lihat)

## RLS Policies yang Diterapkan

| Tabel | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `users` | ✅ Semua | ✅ Semua | ❌ Via RPC | ❌ Via RPC |
| `sessions` | ✅ Semua | ✅ Semua | ✅ Semua | ✅ Semua |
| `tickets` | ✅ Semua | ✅ Semua | ❌ Via RPC | ❌ Via RPC |

## Keamanan
- **UPDATE & DELETE tickets** hanya bisa melalui RPC functions
- RPC functions memvalidasi:
  1. Token session valid & belum expired
  2. Role user sesuai permission (admin/ketua_rt)
  3. Data yang dioperasikan ada
- Menggunakan `SECURITY DEFINER` sehingga bypass RLS secara aman
