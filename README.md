<div align="center">

# 🏘️ SapaIKMP

**Sistem Pengaduan Warga Berbasis Web untuk Lingkungan IKMP**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)](https://github.com/Andrian206/Sistem-Pengaduan)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-orange?style=for-the-badge)](https://github.com/Andrian206/Sistem-Pengaduan/releases)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)

[Live Demo](https://sistem-pengaduan.vercel.app) · [Report Bug](https://github.com/Andrian206/Sistem-Pengaduan/issues) · [Request Feature](https://github.com/Andrian206/Sistem-Pengaduan/issues)

</div>

---

## 📑 Table of Contents

<details>
<summary>Click to expand</summary>

- [About The Project](#-about-the-project)
  - [Overview](#overview)
  - [Problem Statement](#problem-statement)
  - [Solution](#solution)
- [Technical Architecture](#-technical-architecture)
  - [Tech Stack](#tech-stack)
  - [Architecture Comparison](#architecture-comparison)
  - [Project Architecture](#project-architecture)
  - [Directory Structure](#directory-structure)
- [Key Features](#-key-features)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Database Setup](#database-setup)
  - [Docker Deployment](#docker-deployment)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

</details>

---

## 🎯 About The Project

### Overview

**SapaIKMP** adalah platform digital yang memudahkan warga IKMP untuk menyampaikan pengaduan, keluhan, atau aspirasi kepada pengurus RT secara efisien dan transparan. Proyek ini tersedia dalam **dua versi arsitektur**: Demo (untuk pengembangan) dan Production (untuk deployment).

### Problem Statement

- ❌ Proses pengaduan tradisional yang lambat dan tidak efisien
- ❌ Kurangnya transparansi dalam penanganan keluhan
- ❌ Sulit melacak status pengaduan
- ❌ Dokumentasi yang tidak terorganisir

### Solution

- ✅ Platform digital terintegrasi untuk pengaduan real-time
- ✅ Tracking status pengaduan yang transparan
- ✅ Role-based access control untuk pengelolaan yang terstruktur
- ✅ Dokumentasi otomatis dengan attachment gambar
- ✅ **Arsitektur production-ready** dengan keamanan bcrypt & session token

---

## 🏗 Technical Architecture

### Tech Stack

<div align="center">

| Frontend | Backend | Database | DevOps |
|:--------:|:-------:|:--------:|:------:|
| ![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js) | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white) | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) |
| ![React 19](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | ![Supabase Storage](https://img.shields.io/badge/Storage-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) | ![pgcrypto](https://img.shields.io/badge/pgcrypto-336791?style=flat-square&logo=postgresql&logoColor=white) | | |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | | | |
| ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat-square&logo=shadcnui&logoColor=white) | | | |

</div>

### Architecture Comparison

| Aspek | Versi Demo (Simple) | Versi Production (Secure) |
|-------|:-------------------:|:-------------------------:|
| Password Storage | Plain text ❌ | Bcrypt hash (pgcrypto) ✅ |
| Auth Flow | Client-side query | Server-side RPC functions |
| Session | localStorage (user data) | Token-based + server verification |
| RLS | Disabled | Enabled dengan policies |
| Permission Check | Frontend only | Server-side via functions |
| Audit Trail | Tidak ada | Lengkap (audit_logs table) |
| Data Exposure | Password terekspos | Password tersembunyi via VIEW |

> 📚 Lihat [ARCHITECTURE.md](ARCHITECTURE.md) untuk dokumentasi arsitektur lengkap.

### Project Architecture

Proyek ini menggunakan **Next.js App Router** dengan arsitektur berbasis komponen:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  App Router │  │  Components │  │     Custom Hooks        │  │
│  │   (Pages)   │  │  (Shadcn)   │  │  (useAuth, useToast)    │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
└─────────┼────────────────┼──────────────────────┼───────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Supabase Client                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │   │
│  │  │    Auth    │  │  Database  │  │      Storage       │  │   │
│  │  │ (Sessions) │  │   (RLS)    │  │   (Attachments)    │  │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
sistem-pengaduan/
├── 📁 .github/              # GitHub configuration
│   └── copilot-instructions.md
├── 📁 public/               # Static assets
├── 📁 src/
│   ├── 📁 app/              # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   ├── 📁 admin/        # Admin dashboard (demo)
│   │   ├── 📁 admin-secure/ # Admin dashboard (production)
│   │   ├── 📁 dashboard/    # User dashboard (demo)
│   │   ├── 📁 dashboard-secure/ # User dashboard (production)
│   │   ├── 📁 login/        # Authentication (demo)
│   │   ├── 📁 login-secure/ # Authentication (production)
│   │   ├── 📁 register/     # User registration (demo)
│   │   └── 📁 register-secure/ # User registration (production)
│   ├── 📁 components/
│   │   └── 📁 ui/           # Shadcn UI components
│   ├── 📁 hooks/            # Custom React hooks
│   │   ├── useAuth.ts       # Demo authentication hook
│   │   ├── useAuthSecure.ts # Production authentication hook
│   │   └── useToast.tsx     # Toast notifications
│   ├── 📁 lib/              # Utility functions
│   └── 📁 utils/            # Supabase clients
│       ├── supabase.ts      # Demo client
│       └── supabase-secure.ts # Production client
├── 📄 .env.example          # Environment template
├── 📄 docker-compose.yml    # Docker configuration
├── 📄 Dockerfile            # Multi-stage Docker build
├── 📄 package.json          # Dependencies
├── 📄 tailwind.config.ts    # Tailwind configuration
├── 📄 tsconfig.json         # TypeScript config
├── 📄 ARCHITECTURE.md       # Architecture documentation
├── 📄 SISTEM.md             # Backend system documentation
├── 📄 CREATE_USERS.md       # Testing users guide
└── 📄 README.md             # Documentation
```

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **Dual Authentication** | Demo (simple) & Production (bcrypt + session token) |
| 👥 **Role-Based Access Control** | 4 level user (Admin, Ketua RT, RT, Warga) dengan permissions berbeda |
| 📝 **Ticket Management** | CRUD operasi lengkap untuk pengaduan warga |
| 🖼️ **Image Upload** | Dukungan upload foto sebagai bukti pengaduan |
| 📊 **Status Tracking** | Tracking status real-time (PENDING → PROSES → SELESAI) |
| 📱 **Responsive Design** | Mobile-first design, optimal di semua perangkat |
| 🔒 **Row Level Security** | Keamanan data dengan Supabase RLS policies |
| ⚡ **Server Components** | Performa optimal dengan React Server Components |
| 🐳 **Docker Ready** | Multi-stage Dockerfile untuk deployment |
| 📋 **Audit Logging** | Tracking aksi penting (production version) |

---

## 🚀 Getting Started

### Prerequisites

Pastikan Anda sudah menginstall:

| Requirement | Version | Installation Guide |
|-------------|---------|-------------------|
| Node.js | >= 18.x | [nodejs.org](https://nodejs.org/) |
| npm / yarn / pnpm | Latest | Included with Node.js |
| Git | >= 2.x | [git-scm.com](https://git-scm.com/) |
| Docker (optional) | >= 20.x | [docker.com](https://www.docker.com/) |
| Supabase Account | - | [supabase.com](https://supabase.com/) |

```bash
# Verify installations
node --version
npm --version
git --version
docker --version # optional
```

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Andrian206/Sistem-Pengaduan.git
   cd Sistem-Pengaduan
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Configuration

Buat file `.env.local` di root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

<details>
<summary>📝 Environment Variables Reference</summary>

| Variable | Required | Description |
|----------|:--------:|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL project Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anonymous key dari Supabase |

</details>

### Database Setup

Jalankan SQL berikut di Supabase SQL Editor:

<details>
<summary>📊 Demo Version (Simple)</summary>

```sql
-- Tabel users (simple, tanpa auth.users)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'warga' CHECK (role IN ('admin', 'rt', 'ketua_rt', 'warga')),
  full_name TEXT,
  blok_rumah TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel tickets
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROSES', 'SELESAI')),
  user_id UUID REFERENCES users(id),
  user_email TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

</details>

<details>
<summary>🔒 Production Version (Secure)</summary>

Lihat file `supabase-production.sql` atau dokumentasi di [ARCHITECTURE.md](ARCHITECTURE.md) untuk setup lengkap dengan:
- Password hashing (bcrypt via pgcrypto)
- Session token management
- RLS policies
- Audit logging
- Secure RPC functions

</details>

### Docker Deployment

```bash
# Build dengan environment variables
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your_url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -t sapaikmp .

# Run container
docker run -p 3000:3000 sapaikmp

# Atau menggunakan docker-compose
docker-compose up -d
```

---

## 📖 Usage

### User Roles & Permissions

| Role | Route | View Tickets | Create | Update Status | Delete |
|------|:-----:|:------------:|:------:|:-------------:|:------:|
| **Admin** | `/admin` | ✅ All | ❌ | ✅ | ✅ |
| **Ketua RT** | `/admin` | ✅ All | ❌ | ✅ | ❌ |
| **RT** | `/admin` | ✅ All | ❌ | ❌ | ❌ |
| **Warga** | `/dashboard` | Own only | ✅ | ❌ | ❌ |

### Demo vs Production Endpoints

| Feature | Demo Version | Production Version |
|---------|:------------:|:------------------:|
| Login | `/login` | `/login-secure` |
| Register | `/register` | `/register-secure` |
| Dashboard | `/dashboard` | `/dashboard-secure` |
| Admin | `/admin` | `/admin-secure` |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👤 Warga | usersapa123@gmail.com | usersapa123 |
| 🔑 Admin | adminsapa123@gmail.com | adminsapa123 |
| 📋 RT | pakrt123@gmail.com | pakrt123 |
| 👑 Ketua RT | ketuart@gmail.com | ketuart123 |

> ⚠️ **Warning:** Kredensial ini hanya untuk demo. Jangan gunakan di production.
> 📚 Lihat [CREATE_USERS.md](CREATE_USERS.md) untuk panduan membuat akun testing.

### Ticket Status Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│ PENDING  │ ───▶ │  PROSES  │ ───▶ │  SELESAI │
│ (Yellow) │      │ (Blue)   │      │ (Green)  │
└──────────┘      └──────────┘      └──────────┘
```

---

## 📚 API Reference

<details>
<summary>🔐 Authentication</summary>

### Sign Up (Demo)

```typescript
const { data: newUser, error } = await supabase
  .from('users')
  .insert({
    email: 'user@example.com',
    password: 'password123', // Plain text (demo only!)
    full_name: 'User Name',
    role: 'warga'
  })
  .select()
  .single();
```

### Sign Up (Production)

```typescript
const result = await apiRegister(
  'user@example.com',
  'password123',
  'User Name',
  'Blok A1',
  '08123456789'
);
```

### Sign In (Production)

```typescript
const result = await apiLogin('user@example.com', 'password123');
// Returns: { success, user, token, error }
```

</details>

<details>
<summary>🎫 Tickets Operations</summary>

### Get All Tickets (Admin)

```typescript
const { data, error } = await supabase
  .from('tickets')
  .select('*')
  .order('created_at', { ascending: false });
```

### Create Ticket (Warga)

```typescript
const { data, error } = await supabase
  .from('tickets')
  .insert({
    title: 'Lampu Jalan Mati',
    description: 'Lampu di depan blok A tidak menyala',
    user_id: user.id,
    user_email: user.email,
    status: 'PENDING',
    image_url: uploadedImageUrl
  });
```

### Update Ticket Status

```typescript
const { error } = await supabase
  .from('tickets')
  .update({ status: 'PROSES' })
  .eq('id', ticketId);
```

</details>

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Andrian206/Sistem-Pengaduan)

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker Deployment

```bash
# Using docker-compose
docker-compose up -d

# Or build manually
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your_url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -t sapaikmp .

docker run -p 3000:3000 sapaikmp
```

### Environment Variables on Vercel

Tambahkan environment variables berikut di Vercel Dashboard:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |

---

## 🗺️ Roadmap

### Version 1.0 ✅
- [x] Sistem autentikasi sederhana
- [x] CRUD operasi untuk tickets
- [x] Role-based access control
- [x] Responsive UI dengan Tailwind CSS
- [x] Upload gambar untuk bukti

### Version 2.0 (Current) ✅
- [x] Production-ready authentication (bcrypt + session token)
- [x] Server-side RPC functions
- [x] Audit logging
- [x] Docker support
- [x] Dual architecture (demo & production)

### Version 2.1 (Planned)
- [ ] Notifikasi real-time
- [ ] Email notification saat status berubah
- [ ] Dashboard analytics untuk Admin
- [ ] Export laporan ke PDF

### Version 3.0 (Future)
- [ ] Push notifications
- [ ] Chat langsung dengan RT
- [ ] Multi-bahasa (i18n)
- [ ] Dark mode
- [ ] 2FA untuk admin

See the [open issues](https://github.com/Andrian206/Sistem-Pengaduan/issues) for a full list of proposed features.

---

## 🤝 Contributing

Kontribusi sangat diapresiasi! Berikut cara berkontribusi:

1. **Fork the Project**
2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**
   ```bash
   git commit -m 'feat: add AmazingFeature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Commit Convention

| Type | Description |
|------|-------------|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `docs` | Dokumentasi |
| `style` | Formatting, semicolons, dll |
| `refactor` | Refactoring code |
| `test` | Menambah tests |
| `chore` | Maintenance |

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 📬 Contact

<div align="center">

**Andrian**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Andrian206)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:andrian@example.com)

🔗 **Project Link:** [https://github.com/Andrian206/Sistem-Pengaduan](https://github.com/Andrian206/Sistem-Pengaduan)

</div>

---

## 📚 Additional Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arsitektur production-ready lengkap |
| [SISTEM.md](SISTEM.md) | Dokumentasi sistem backend |
| [CREATE_USERS.md](CREATE_USERS.md) | Panduan membuat akun testing |

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by Andrian

</div>