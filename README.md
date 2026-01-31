# SapaIKMP - Sistem Pengaduan Warga

Aplikasi pengaduan warga berbasis web untuk lingkungan IKMP.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS + Shadcn/UI
- **Language**: TypeScript

## User Roles

| Role | Akses | Permissions |
|------|-------|-------------|
| `admin` | `/admin` | View all tickets, Update status, Delete tickets |
| `ketua_rt` | `/admin` | View all tickets, Update status |
| `rt` | `/admin` | View all tickets (read-only) |
| `warga` | `/dashboard` | Create tickets, View own tickets |

## Getting Started

### 1. Clone & Install

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Database Setup (Supabase)

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'warga' CHECK (role IN ('admin', 'rt', 'ketua_rt', 'warga')),
  full_name TEXT,
  blok_rumah TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Tickets Table

```sql
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROSES', 'SELESAI')),
  user_id UUID REFERENCES auth.users,
  user_email TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Warga | usersapa123@gmail.com | usersapa123 |
| Admin | adminsapa123@gmail.com | adminsapa123 |
| RT | pakrt123@gmail.com | pakrt123 |
| Ketua RT | ketuart@gmail.com | ketuart123 |

## Deploy on Vercel

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.
