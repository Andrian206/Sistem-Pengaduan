# 🔒 Arsitektur Production-Ready SapaIKMP

## Overview

Dokumen ini menjelaskan arsitektur keamanan untuk sistem pengaduan SapaIKMP yang siap untuk production.

---

## 📊 Perbandingan Arsitektur

| Aspek | Versi Demo (Simple) | Versi Production (Secure) |
|-------|---------------------|---------------------------|
| Password Storage | Plain text ❌ | Bcrypt hash (pgcrypto) ✅ |
| Auth Flow | Client-side query | Server-side RPC functions |
| Session | localStorage (user data) | Token-based + server verification |
| RLS | Disabled | Enabled dengan policies |
| Permission Check | Frontend only | Server-side via functions |
| Audit Trail | Tidak ada | Lengkap (audit_logs table) |
| Data Exposure | Password terekspos | Password tersembunyi via VIEW |

---

## 🏗️ Arsitektur Keamanan

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  useAuthSecure Hook                                             │
│  ├── login() → apiLogin() → RPC login_user()                   │
│  ├── register() → apiRegister() → RPC register_user()          │
│  ├── logout() → apiLogout() → RPC logout_user()                │
│  └── initAuth() → apiVerifySession() → RPC verify_session()    │
├─────────────────────────────────────────────────────────────────┤
│  Token Storage: localStorage (token only, bukan user data)      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE RPC FUNCTIONS                        │
├─────────────────────────────────────────────────────────────────┤
│  SECURITY DEFINER = Dijalankan dengan privileges tinggi         │
│                                                                  │
│  Auth Functions:                                                 │
│  ├── register_user(email, password, ...) → Hash + Insert        │
│  ├── login_user(email, password) → Verify hash + Create session │
│  ├── verify_session(token) → Check expiry + Return user         │
│  └── logout_user(token) → Delete session                        │
│                                                                  │
│  Business Functions (with permission check):                     │
│  ├── create_ticket(token, title, desc) → Check role + Insert    │
│  ├── update_ticket_status(token, id, status) → Check role       │
│  └── delete_ticket(token, id) → Admin only                      │
│                                                                  │
│  Semua function:                                                 │
│  ✅ Verify session token                                         │
│  ✅ Check role/permissions                                       │
│  ✅ Write audit log                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                       │
├─────────────────────────────────────────────────────────────────┤
│  Tables:                                                         │
│  ├── users (password_hash, role, dll)                           │
│  ├── sessions (token, expires_at, user_id)                      │
│  ├── tickets (dengan RLS)                                       │
│  └── audit_logs (action, entity, old/new values)                │
│                                                                  │
│  Views:                                                          │
│  └── public_users (users TANPA password_hash)                   │
│                                                                  │
│  RLS Policies:                                                   │
│  ├── users: No direct access (hanya via functions)              │
│  ├── sessions: No direct access                                 │
│  ├── tickets: Read only, write via functions                    │
│  └── audit_logs: No direct access                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/
├── utils/
│   ├── supabase.ts          # Versi demo (simple)
│   └── supabase-secure.ts   # Versi production (aman)
│
├── hooks/
│   ├── useAuth.ts           # Versi demo
│   └── useAuthSecure.ts     # Versi production
│
├── app/
│   ├── login/               # Demo login
│   ├── login-secure/        # Production login
│   ├── register/            # Demo register
│   ├── register-secure/     # Production register
│   ├── dashboard/           # Demo dashboard
│   ├── dashboard-secure/    # Production dashboard
│   ├── admin/               # Demo admin
│   └── admin-secure/        # Production admin

Database:
├── supabase-simple.sql      # Schema demo (RLS off, plain password)
└── supabase-production.sql  # Schema production (RLS on, hashed password)
```

---

## 🚀 Cara Migrasi ke Production

### 1. Setup Database

```bash
# Jalankan di Supabase SQL Editor
# PERHATIAN: Ini akan MENGHAPUS semua data existing!
```

Copy-paste isi file `supabase-production.sql` ke Supabase SQL Editor dan jalankan.

### 2. Update Imports

Ganti semua import di halaman dari versi demo ke versi secure:

```typescript
// SEBELUM (Demo)
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/utils/supabase";

// SESUDAH (Production)
import { useAuthSecure } from "@/hooks/useAuthSecure";
import { supabase, apiLogin, apiCreateTicket } from "@/utils/supabase-secure";
```

### 3. Atau Rename File

Alternatif lebih mudah - rename file secure menjadi file utama:

```bash
# Backup dulu
mv src/utils/supabase.ts src/utils/supabase-demo.ts
mv src/hooks/useAuth.ts src/hooks/useAuth-demo.ts

# Rename secure ke main
mv src/utils/supabase-secure.ts src/utils/supabase.ts
mv src/hooks/useAuthSecure.ts src/hooks/useAuth.ts

# Rename halaman
mv src/app/login-secure src/app/login
mv src/app/register-secure src/app/register
mv src/app/dashboard-secure src/app/dashboard
mv src/app/admin-secure src/app/admin
```

---

## 🔐 Security Features

### 1. Password Hashing

```sql
-- Menggunakan pgcrypto bcrypt dengan cost factor 10
CREATE OR REPLACE FUNCTION hash_password(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(plain_password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Session Token

- Token 256-bit random (32 bytes hex)
- Expires dalam 7 hari
- Disimpan di tabel `sessions` dengan `user_id`
- Setiap login = session baru
- Logout = hapus session dari DB

### 3. Role-Based Access Control

```typescript
// Permission check di SERVER (dalam SQL function)
IF v_user_role NOT IN ('admin', 'ketua_rt') THEN
  RETURN json_build_object('success', false, 'error', 'Tidak memiliki akses');
END IF;
```

### 4. Audit Logging

Setiap aksi penting dicatat:
- LOGIN / LOGOUT
- CREATE / UPDATE / DELETE ticket
- Menyimpan old_values dan new_values

### 5. Row Level Security

```sql
-- Contoh: Users tidak bisa diakses langsung
CREATE POLICY "No direct access to users" ON users FOR ALL USING (false);

-- Tickets hanya bisa dibaca, write via functions
CREATE POLICY "Anyone can read tickets" ON tickets FOR SELECT USING (true);
CREATE POLICY "No direct insert to tickets" ON tickets FOR INSERT WITH CHECK (false);
```

---

## 📊 Security Score Comparison

| Kategori | Demo | Production |
|----------|------|------------|
| Authentication | 2/10 | 9/10 |
| Authorization | 3/10 | 9/10 |
| Data Protection | 3/10 | 8/10 |
| Input Validation | 5/10 | 8/10 |
| Session Management | 4/10 | 9/10 |
| Audit Trail | 0/10 | 10/10 |
| **Total** | **2.8/10** | **8.8/10** |

---

## ⚠️ Yang Masih Perlu Dipertimbangkan untuk Production Penuh

1. **Rate Limiting** - Tambahkan di edge/middleware untuk prevent brute force
2. **HTTPS Only** - Pastikan deployment menggunakan HTTPS
3. **HttpOnly Cookies** - Untuk keamanan ekstra, ganti localStorage dengan cookies
4. **CORS Settings** - Konfigurasi di Supabase dashboard
5. **Input Sanitization** - Tambahkan validation lebih ketat
6. **Password Policy** - Minimal length, complexity requirements
7. **2FA** - Two-factor authentication untuk admin

---

## 🧪 Testing

### Login dengan akun demo:

| Role | Email | Password |
|------|-------|----------|
| Admin | adminsapa123@gmail.com | adminsapa123 |
| RT | pakrt123@gmail.com | pakrt123 |
| Ketua RT | ketuart@gmail.com | ketuart123 |
| Warga | usersapa123@gmail.com | usersapa123 |

### Test Endpoints:

1. **Login**: `/login-secure`
2. **Register**: `/register-secure`
3. **Dashboard Warga**: `/dashboard-secure`
4. **Admin Panel**: `/admin-secure`

---

## 📝 Changelog

- **v1.0** - Initial demo version (supabase-simple.sql)
- **v2.0** - Production version dengan:
  - Password hashing (bcrypt)
  - Server-side session management
  - RLS policies
  - Audit logging
  - Secure RPC functions
