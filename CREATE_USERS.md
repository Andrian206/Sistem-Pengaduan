# Cara Membuat Akun Testing

## ⚠️ PENTING
Supabase tidak mengizinkan insert langsung ke `auth.users` via SQL. 
Gunakan salah satu cara berikut:

---

## 🚀 CARA 1: Via Supabase Dashboard (PALING MUDAH)

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. **Pilih Project**: `sistem-pengaduan`
3. **Klik Authentication** → **Users**
4. **Klik "Add User"** atau **"Invite"**
5. **Tambahkan user satu per satu:**

### User 1: ADMIN
- Email: `adminsapa123@gmail.com`
- Password: `adminsapa123`
- ✅ Auto Confirm User (centang ini!)

### User 2: RT
- Email: `pakrt123@gmail.com`
- Password: `pakrt123`
- ✅ Auto Confirm User

### User 3: KETUA RT
- Email: `ketuart@gmail.com`
- Password: `ketuart123`
- ✅ Auto Confirm User

### User 4: WARGA
- Email: `usersapa123@gmail.com`
- Password: `usersapa123`
- ✅ Auto Confirm User

6. **Setelah semua user dibuat**, jalankan query ini di **SQL Editor**:

```sql
-- Update role untuk setiap user
UPDATE profiles SET role = 'admin', full_name = 'Admin SapaIKMP' 
WHERE email = 'adminsapa123@gmail.com';

UPDATE profiles SET role = 'rt', full_name = 'Pak RT' 
WHERE email = 'pakrt123@gmail.com';

UPDATE profiles SET role = 'ketua_rt', full_name = 'Ketua RT' 
WHERE email = 'ketuart@gmail.com';

UPDATE profiles SET role = 'warga', full_name = 'User Warga' 
WHERE email = 'usersapa123@gmail.com';

-- Verifikasi
SELECT u.email, p.role, p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY p.role;
```

---

## 🔧 CARA 2: Via Register Page (Manual)

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Buka browser**: http://localhost:3000/register

3. **Register user satu per satu**:
   - adminsapa123@gmail.com / adminsapa123
   - pakrt123@gmail.com / pakrt123
   - ketuart@gmail.com / ketuart123
   - usersapa123@gmail.com / usersapa123

4. **Update role via SQL** (lihat query di CARA 1 step 6)

---

## ✅ Verifikasi User Berhasil Dibuat

Jalankan query ini di SQL Editor:

```sql
SELECT 
  u.email,
  u.email_confirmed_at,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY p.role;
```

**Expected Output:**
| email | email_confirmed_at | role | full_name |
|-------|-------------------|------|-----------|
| adminsapa123@gmail.com | (timestamp) | admin | Admin SapaIKMP |
| ketuart@gmail.com | (timestamp) | ketua_rt | Ketua RT |
| pakrt123@gmail.com | (timestamp) | rt | Pak RT |
| usersapa123@gmail.com | (timestamp) | warga | User Warga |

---

## 🎯 Login Testing

Setelah user dibuat, test login:

- **Admin**: http://localhost:3000/login
  - Email: `adminsapa123@gmail.com`
  - Pass: `adminsapa123`
  - Redirect ke: `/admin`

- **RT**: http://localhost:3000/login
  - Email: `pakrt123@gmail.com`
  - Pass: `pakrt123`
  - Redirect ke: `/admin`

- **Ketua RT**: http://localhost:3000/login
  - Email: `ketuart@gmail.com`
  - Pass: `ketuart123`
  - Redirect ke: `/admin`

- **Warga**: http://localhost:3000/login
  - Email: `usersapa123@gmail.com`
  - Pass: `usersapa123`
  - Redirect ke: `/dashboard`
