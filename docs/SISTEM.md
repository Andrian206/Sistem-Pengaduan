# 📚 Dokumentasi Sistem BackEnd - SapaIKMP

## 📋 Daftar Isi

1. [Ringkasan Eksekutif](#ringkasan-eksekutif)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Stack Teknologi](#stack-teknologi)
4. [Skema Database](#skema-database)
5. [Sistem Autentikasi & Otorisasi](#sistem-autentikasi--otorisasi)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Alur Data & Operasi CRUD](#alur-data--operasi-crud)
8. [Storage & File Upload](#storage--file-upload)
9. [Diagram Alur](#diagram-alur)
10. [Keamanan Sistem](#keamanan-sistem)

---

## 🎯 Ringkasan Eksekutif

**SapaIKMP** adalah aplikasi sistem pengaduan berbasis web yang memungkinkan warga untuk menyampaikan laporan/keluhan kepada pengurus RT. Sistem ini dibangun dengan arsitektur **serverless** menggunakan **Next.js** sebagai frontend framework dan **Supabase** sebagai Backend-as-a-Service (BaaS).

### Fitur Utama:
- 📝 Pembuatan laporan/pengaduan oleh warga
- 📊 Dashboard admin untuk mengelola laporan
- 👥 Sistem role-based access control (4 role berbeda)
- 📸 Upload bukti foto untuk setiap laporan
- 🔄 Tracking status laporan (PENDING → PROSES → SELESAI)

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Next.js 16 (React 19)                    ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   ││
│  │  │ Landing  │  │  Login   │  │ Register │  │Dashboard │   ││
│  │  │  Page    │  │  Page    │  │   Page   │  │  Pages   │   ││
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   ││
│  └───────┼─────────────┼────────────┼─────────────┼──────────┘│
│          │             │            │             │            │
│          ▼             ▼            ▼             ▼            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Supabase Client SDK (@supabase/supabase-js)   ││
│  │                      src/utils/supabase.ts                  ││
│  └──────────────────────────┬──────────────────────────────────┘│
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SUPABASE (BaaS)                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐│
│  │  Auth       │  │  PostgreSQL  │  │      Storage            ││
│  │  Service    │  │   Database   │  │   (attachments bucket)  ││
│  │             │  │              │  │                         ││
│  │ - signUp    │  │ - profiles   │  │  - Image uploads        ││
│  │ - signIn    │  │ - tickets    │  │  - Public URLs          ││
│  │ - signOut   │  │              │  │                         ││
│  └──────┬──────┘  └──────┬───────┘  └───────────┬─────────────┘│
│         │                │                      │               │
│         ▼                ▼                      ▼               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                Row Level Security (RLS)                     ││
│  │          Mengontrol akses data berdasarkan role             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Pola Arsitektur:

| Komponen | Deskripsi |
|----------|-----------|
| **Frontend** | Next.js dengan App Router, Client Components |
| **Backend** | Supabase (Serverless - tidak ada server custom) |
| **Database** | PostgreSQL (managed by Supabase) |
| **Auth** | Supabase Auth dengan email/password |
| **Storage** | Supabase Storage untuk file attachments |
| **Security** | Row Level Security (RLS) policies |

---

## 🛠️ Stack Teknologi

### Frontend Dependencies

| Package | Versi | Fungsi |
|---------|-------|--------|
| `next` | 16.1.4 | React framework dengan App Router |
| `react` | 19.2.3 | UI library |
| `@supabase/supabase-js` | 2.91.0 | Supabase client SDK |
| `@radix-ui/*` | Various | Komponen UI primitif (Dialog, Select, dll) |
| `tailwindcss` | 4.x | CSS framework |
| `lucide-react` | 0.562.0 | Icon library |

### Backend (Supabase)

| Service | Fungsi |
|---------|--------|
| **Auth** | Autentikasi pengguna (email/password) |
| **Database** | PostgreSQL untuk penyimpanan data |
| **Storage** | Bucket untuk upload file gambar |
| **Realtime** | (Tersedia tapi belum diimplementasi) |

---

## 🗄️ Skema Database

### Tabel `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'rt', 'ketua_rt', 'warga')),
  full_name TEXT,
  blok_rumah TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | UUID | Primary key, referensi ke `auth.users` |
| `email` | TEXT | Email pengguna (unique) |
| `role` | TEXT | Role pengguna: `admin`, `rt`, `ketua_rt`, `warga` |
| `full_name` | TEXT | Nama lengkap pengguna |
| `blok_rumah` | TEXT | Alamat blok rumah |
| `phone` | TEXT | Nomor telepon |
| `created_at` | TIMESTAMPTZ | Waktu pembuatan akun |

### Tabel `tickets`

```sql
CREATE TABLE tickets (
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
```

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | UUID | Primary key, auto-generated |
| `title` | TEXT | Judul laporan |
| `description` | TEXT | Deskripsi/kronologi masalah |
| `status` | TEXT | Status: `PENDING`, `PROSES`, `SELESAI` |
| `user_id` | UUID | Foreign key ke pemilik laporan |
| `user_email` | TEXT | Email pelapor (untuk tampilan) |
| `image_url` | TEXT | URL gambar bukti (nullable) |
| `created_at` | TIMESTAMPTZ | Waktu pembuatan laporan |
| `updated_at` | TIMESTAMPTZ | Waktu update terakhir |

### Relasi Database

```
┌──────────────┐         ┌──────────────┐
│  auth.users  │         │   profiles   │
│──────────────│         │──────────────│
│ id (PK)      │◄────────│ id (PK, FK)  │
│ email        │         │ email        │
│ ...          │         │ role         │
└──────────────┘         │ full_name    │
       │                 │ blok_rumah   │
       │                 │ phone        │
       │                 │ created_at   │
       │                 └──────────────┘
       │
       │
       ▼
┌──────────────┐
│   tickets    │
│──────────────│
│ id (PK)      │
│ title        │
│ description  │
│ status       │
│ user_id (FK) │────► Referensi ke auth.users
│ user_email   │
│ image_url    │
│ created_at   │
│ updated_at   │
└──────────────┘
```

---

## 🔐 Sistem Autentikasi & Otorisasi

### Role System

Sistem menggunakan 4 role dengan permission berbeda:

```typescript
export type UserRole = 'admin' | 'rt' | 'ketua_rt' | 'warga';
```

### Permission Matrix

| Permission | Admin | Ketua RT | RT | Warga |
|------------|:-----:|:--------:|:--:|:-----:|
| `canViewAllTickets` | ✅ | ✅ | ✅ | ❌ |
| `canUpdateStatus` | ✅ | ✅ | ❌ | ❌ |
| `canDeleteTicket` | ✅ | ❌ | ❌ | ❌ |
| `canCreateTicket` | ❌ | ❌ | ❌ | ✅ |
| **Dashboard Path** | `/admin` | `/admin` | `/admin` | `/dashboard` |

### Konfigurasi Permission (supabase.ts)

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, {
  canViewAllTickets: boolean;
  canUpdateStatus: boolean;
  canDeleteTicket: boolean;
  canCreateTicket: boolean;
  dashboardPath: string;
  label: string;
}> = {
  admin: {
    canViewAllTickets: true,
    canUpdateStatus: true,
    canDeleteTicket: true,
    canCreateTicket: false,
    dashboardPath: '/admin',
    label: 'Administrator'
  },
  rt: {
    canViewAllTickets: true,
    canUpdateStatus: false,
    canDeleteTicket: false,
    canCreateTicket: false,
    dashboardPath: '/admin',
    label: 'Kepala RT'
  },
  ketua_rt: {
    canViewAllTickets: true,
    canUpdateStatus: true,
    canDeleteTicket: false,
    canCreateTicket: false,
    dashboardPath: '/admin',
    label: 'Ketua RT'
  },
  warga: {
    canViewAllTickets: false,
    canUpdateStatus: false,
    canDeleteTicket: false,
    canCreateTicket: true,
    dashboardPath: '/dashboard',
    label: 'Warga'
  }
};
```

### Alur Autentikasi

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLOW AUTENTIKASI                           │
└─────────────────────────────────────────────────────────────────┘

[Register Flow]
     │
     ▼
┌──────────────┐    ┌─────────────────┐    ┌──────────────────────┐
│ User Input   │───►│ supabase.auth   │───►│ Trigger SQL          │
│ - email      │    │ .signUp()       │    │ handle_new_user()    │
│ - password   │    │                 │    │                      │
│ - metadata   │    │ Membuat user    │    │ Auto-create profile  │
│   (nama,dll) │    │ di auth.users   │    │ dengan role='warga'  │
└──────────────┘    └─────────────────┘    └──────────────────────┘

[Login Flow]
     │
     ▼
┌──────────────┐    ┌─────────────────┐    ┌──────────────────────┐
│ Email &      │───►│ supabase.auth   │───►│ Fetch Profile        │
│ Password     │    │ .signInWith     │    │ untuk dapat role     │
│              │    │  Password()     │    │                      │
└──────────────┘    └─────────────────┘    └──────────┬───────────┘
                                                      │
                                                      ▼
                                           ┌──────────────────────┐
                                           │ Redirect berdasarkan │
                                           │ ROLE_PERMISSIONS     │
                                           │ .dashboardPath       │
                                           └──────────────────────┘
```

### Auto Profile Creation Trigger

Ketika user baru mendaftar, trigger SQL secara otomatis membuat profil:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, blok_rumah, phone)
  VALUES (
    NEW.id,
    NEW.email,
    'warga', -- default role untuk semua pendaftar baru
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'blok_rumah',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🛡️ Row Level Security (RLS)

RLS adalah mekanisme keamanan di level database yang mengontrol akses data berdasarkan user yang sedang login.

### RLS pada Tabel `profiles`

```sql
-- User hanya bisa melihat profil sendiri
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- User hanya bisa update profil sendiri
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User hanya bisa insert profil sendiri
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### RLS pada Tabel `tickets`

```sql
-- Warga hanya bisa melihat tiket miliknya sendiri
CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Warga hanya bisa membuat tiket untuk dirinya sendiri
CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin/RT/Ketua RT bisa melihat SEMUA tiket
CREATE POLICY "Admin can view all tickets" ON tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'rt', 'ketua_rt')
    )
  );

-- Hanya Admin dan Ketua RT yang bisa update tiket
CREATE POLICY "Admin can update tickets" ON tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'ketua_rt')
    )
  );
```

### Visualisasi RLS

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROW LEVEL SECURITY                         │
└─────────────────────────────────────────────────────────────────┘

┌────────────────┐     SELECT * FROM tickets     ┌────────────────┐
│     Warga      │ ─────────────────────────────►│   Database     │
│   (user_id=1)  │                               │                │
└────────────────┘                               │  ┌──────────┐  │
                                                 │  │ Ticket 1 │◄─┤ user_id=1 ✅ RETURN
        RLS Filter:                              │  │ user_id=1│  │
        auth.uid() = user_id                     │  └──────────┘  │
                                                 │  ┌──────────┐  │
                                                 │  │ Ticket 2 │◄─┤ user_id=2 ❌ HIDE
                                                 │  │ user_id=2│  │
                                                 │  └──────────┘  │
                                                 │  ┌──────────┐  │
                                                 │  │ Ticket 3 │◄─┤ user_id=1 ✅ RETURN
                                                 │  │ user_id=1│  │
                                                 │  └──────────┘  │
                                                 └────────────────┘

┌────────────────┐     SELECT * FROM tickets     ┌────────────────┐
│     Admin      │ ─────────────────────────────►│   Database     │
│   (role=admin) │                               │                │
└────────────────┘                               │  ┌──────────┐  │
                                                 │  │ Ticket 1 │◄─┤ ✅ RETURN
        RLS Filter:                              │  └──────────┘  │
        role IN ('admin','rt','ketua_rt')        │  ┌──────────┐  │
                                                 │  │ Ticket 2 │◄─┤ ✅ RETURN
                                                 │  └──────────┘  │
                                                 │  ┌──────────┐  │
                                                 │  │ Ticket 3 │◄─┤ ✅ RETURN
                                                 │  └──────────┘  │
                                                 └────────────────┘
```

---

## 🔄 Alur Data & Operasi CRUD

### 1. CREATE - Membuat Laporan Baru

```typescript
// dashboard/page.tsx - submitTicket()

async function submitTicket() {
  // 1. Upload gambar (jika ada)
  if (image) {
    const filePath = `${user.id}/${Date.now()}.${ext}`;
    await supabase.storage.from('attachments').upload(filePath, image);
    imageUrl = supabase.storage.from('attachments').getPublicUrl(filePath);
  }

  // 2. Insert ticket ke database
  await supabase.from("tickets").insert({
    title: title,
    description: desc,
    user_id: user.id,
    user_email: user.email,
    status: "PENDING",
    image_url: imageUrl
  });
}
```

**Alur Visual:**

```
┌────────────┐    ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│ User Form  │───►│ Upload      │───►│ Insert       │───►│ Ticket       │
│ - title    │    │ Image to    │    │ Ticket to    │    │ Created!     │
│ - desc     │    │ Storage     │    │ Database     │    │ status=      │
│ - image    │    │ Bucket      │    │              │    │ PENDING      │
└────────────┘    └─────────────┘    └──────────────┘    └──────────────┘
```

### 2. READ - Mengambil Data Laporan

**Untuk Warga (hanya tiket sendiri):**
```typescript
// dashboard/page.tsx
const { data } = await supabase
  .from("tickets")
  .select("*")
  .eq("user_id", user.id)  // Filter by user
  .order("created_at", { ascending: false });
```

**Untuk Admin/RT/Ketua RT (semua tiket):**
```typescript
// admin/page.tsx
const { data } = await supabase
  .from("tickets")
  .select("*")
  .order("created_at", { ascending: false });
// RLS otomatis mengizinkan karena role admin/rt/ketua_rt
```

### 3. UPDATE - Mengubah Status Laporan

```typescript
// admin/page.tsx - updateStatus()

async function updateStatus(id: string, newStatus: string) {
  // Permission check di frontend
  if (!permissions.canUpdateStatus) return;
  
  // Update di database
  await supabase
    .from("tickets")
    .update({ status: newStatus })
    .eq("id", id);
}
```

**Status Lifecycle:**

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│ PENDING  │────────►│  PROSES  │────────►│ SELESAI  │
│ 🕒       │  Admin/ │ 🛠️       │  Admin/ │ ✅       │
│          │ KetuaRT │          │ KetuaRT │          │
└──────────┘         └──────────┘         └──────────┘
    │                                          │
    └──────────────────────────────────────────┘
              (bisa langsung selesai)
```

### 4. DELETE - Menghapus Laporan

```typescript
// admin/page.tsx - deleteTicket()

async function deleteTicket(id: string) {
  // Hanya admin yang bisa hapus
  if (!permissions.canDeleteTicket) return;
  if (!confirm("Yakin ingin menghapus laporan ini?")) return;

  await supabase.from("tickets").delete().eq("id", id);
}
```

---

## 📁 Storage & File Upload

### Konfigurasi Storage Bucket

```sql
-- Buat bucket 'attachments' untuk menyimpan gambar
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true);
```

### Storage Policies

```sql
-- Siapa saja yang login bisa upload
CREATE POLICY "Anyone can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'attachments');

-- Semua orang bisa melihat attachment (public)
CREATE POLICY "Anyone can view attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'attachments');
```

### Alur Upload File

```typescript
// 1. Buat path unik
const filePath = `${user.id}/${Date.now()}.${fileExt}`;

// 2. Upload ke Supabase Storage
await supabase.storage
  .from('attachments')
  .upload(filePath, imageFile);

// 3. Dapatkan public URL
const { data } = supabase.storage
  .from('attachments')
  .getPublicUrl(filePath);

// 4. Simpan URL di database
imageUrl = data.publicUrl;
```

**Struktur Folder di Storage:**

```
attachments/
├── {user_id_1}/
│   ├── 1706789012345.jpg
│   └── 1706789054321.png
├── {user_id_2}/
│   └── 1706789098765.jpg
└── {user_id_3}/
    ├── 1706789111222.jpg
    └── 1706789333444.png
```

---

## 📊 Diagram Alur

### Alur Lengkap Sistem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SISTEM PENGADUAN SAPAIKMP                          │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │  Landing Page   │
                              │     (/)         │
                              └────────┬────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
     ┌────────────────┐       ┌────────────────┐       ┌────────────────┐
     │    Register    │       │     Login      │       │  View Stats    │
     │  (/register)   │       │   (/login)     │       │  (Public)      │
     └───────┬────────┘       └───────┬────────┘       └────────────────┘
             │                        │
             ▼                        ▼
     ┌────────────────┐       ┌────────────────┐
     │ Create Account │       │  Authenticate  │
     │ + Auto Profile │       │  + Get Role    │
     └───────┬────────┘       └───────┬────────┘
             │                        │
             ▼                        │
     ┌────────────────┐               │
     │ Email Confirm  │               │
     │ (if required)  │               │
     └───────┬────────┘               │
             │                        │
             └────────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Check User Role      │
              │  (from profiles)      │
              └───────────┬───────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│ role = 'warga'  │               │ role IN         │
│                 │               │ ('admin','rt',  │
│                 │               │  'ketua_rt')    │
└────────┬────────┘               └────────┬────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│  User Dashboard │               │ Admin Dashboard │
│   (/dashboard)  │               │    (/admin)     │
│                 │               │                 │
│ • View my       │               │ • View ALL      │
│   tickets       │               │   tickets       │
│ • Create new    │               │ • Update status │
│   ticket        │               │   (admin/ketua) │
│ • Upload image  │               │ • Delete ticket │
│                 │               │   (admin only)  │
└─────────────────┘               └─────────────────┘
```

### Alur Request-Response

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        REQUEST-RESPONSE FLOW                              │
└──────────────────────────────────────────────────────────────────────────┘

[1] CLIENT REQUEST
    │
    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Next.js Client Component (Browser)                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  supabase.from('tickets').select('*')                            │  │
│  │  atau                                                             │  │
│  │  supabase.from('tickets').insert({...})                          │  │
│  └───────────────────────────┬──────────────────────────────────────┘  │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
                               │ HTTPS Request + JWT Token
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Supabase PostgREST API                                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  1. Validate JWT Token                                           │  │
│  │  2. Extract user ID (auth.uid())                                 │  │
│  │  3. Apply RLS Policies                                           │  │
│  │  4. Execute SQL Query                                            │  │
│  │  5. Return filtered results                                      │  │
│  └───────────────────────────┬──────────────────────────────────────┘  │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Query dengan RLS:                                               │  │
│  │  SELECT * FROM tickets WHERE                                     │  │
│  │    (auth.uid() = user_id)  -- untuk warga                        │  │
│  │    OR                                                            │  │
│  │    (role IN ('admin','rt','ketua_rt'))  -- untuk admin           │  │
│  └───────────────────────────┬──────────────────────────────────────┘  │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
                               │ JSON Response
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Client Component                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  setTickets(data)  // Update React State                         │  │
│  │  → Re-render UI                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Keamanan Sistem

### Layer Keamanan

```
┌─────────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                              │
└─────────────────────────────────────────────────────────────────┘

Layer 1: ENVIRONMENT VARIABLES
├── NEXT_PUBLIC_SUPABASE_URL (tidak sensitif)
└── NEXT_PUBLIC_SUPABASE_ANON_KEY (limited access key)

Layer 2: SUPABASE AUTH
├── JWT Token validation
├── Session management
└── Secure password hashing (bcrypt)

Layer 3: ROW LEVEL SECURITY (RLS)
├── Database-level access control
├── Policy-based filtering
└── Tidak bisa di-bypass dari client

Layer 4: FRONTEND PERMISSION CHECK
├── UI-based access control
├── Role-based component rendering
└── Navigation guards
```

### Security Best Practices yang Diterapkan

| Practice | Implementasi |
|----------|--------------|
| ✅ Environment Variables | Kredensial disimpan di `.env.local` |
| ✅ RLS Policies | Semua tabel dilindungi RLS |
| ✅ Role-Based Access | 4 role dengan permission berbeda |
| ✅ Cascade Delete | Profile & tickets dihapus saat user dihapus |
| ✅ Input Validation | Check required fields sebelum submit |
| ✅ Secure File Upload | File disimpan per-user di storage |

### Validasi di Setiap Layer

```typescript
// Layer 1: Frontend Validation
if (!title || !desc) return alert("Mohon isi semua field!");

// Layer 2: Permission Check
if (!permissions.canUpdateStatus) return;

// Layer 3: Supabase Auth Check
const { data: { user } } = await supabase.auth.getUser();
if (!user) router.push('/login');

// Layer 4: RLS (Automatic di Database)
// Query otomatis difilter berdasarkan policies
```

---

## 📝 Kesimpulan

Sistem BackEnd SapaIKMP menggunakan arsitektur **serverless** yang modern dan aman:

1. **Tidak ada server custom** - Semua logic backend ditangani oleh Supabase
2. **Row Level Security** - Keamanan data di level database
3. **Role-Based Access Control** - 4 role dengan permission berbeda
4. **Automatic Profile Creation** - Trigger SQL saat user register
5. **Secure File Storage** - Gambar disimpan terpisah dengan public URL

### Kelebihan Arsitektur Ini:

| Aspek | Keuntungan |
|-------|------------|
| **Skalabilitas** | Supabase auto-scale |
| **Keamanan** | RLS di database level |
| **Maintenance** | Tidak perlu kelola server |
| **Cost** | Pay-as-you-go, hemat untuk MVP |
| **Development Speed** | Fokus ke frontend, backend sudah ready |

### Komponen yang Bisa Ditambahkan:

- [ ] Realtime subscriptions untuk notifikasi
- [ ] Email notifications saat status berubah
- [ ] Audit log untuk tracking perubahan
- [ ] Rate limiting untuk prevent abuse
- [ ] Backup otomatis database

---

> 📅 **Terakhir Diperbarui:** 1 Februari 2026  
> 🔧 **Dibuat untuk:** Dokumentasi Sistem SapaIKMP
