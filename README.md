<div align="center">

# 🏘️ SapaIKMP

**Sistem Pengaduan Warga Berbasis Web untuk Lingkungan IKMP**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)](https://github.com/Andrian206/Sistem-Pengaduan)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-orange?style=for-the-badge)](https://github.com/Andrian206/Sistem-Pengaduan/releases)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
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
  - [Project Architecture](#project-architecture)
  - [Directory Structure](#directory-structure)
- [Key Features](#-key-features)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Database Setup](#database-setup)
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

SapaIKMP adalah aplikasi web pengaduan warga yang dirancang khusus untuk lingkungan IKMP. Dibangun dengan Next.js 16 dan Supabase, aplikasi ini menyediakan platform digital bagi warga untuk menyampaikan keluhan, saran, dan laporan kepada pengurus RT dengan mudah dan transparan.

> **Note:** Aplikasi ini sudah production-ready dan dapat di-deploy ke Vercel.

### Problem Statement

Pengelolaan pengaduan warga di lingkungan perumahan seringkali menghadapi berbagai kendala:

- 📝 **Proses Manual** - Pengaduan masih menggunakan cara konvensional (kertas/lisan)
- 🔍 **Kurang Transparansi** - Warga tidak dapat memantau status pengaduan mereka
- ⏱️ **Respon Lambat** - Tidak ada sistem prioritas dan tracking yang jelas
- 📊 **Tidak Ada Dokumentasi** - Sulit melacak histori pengaduan sebelumnya

### Solution

SapaIKMP menyediakan solusi digital yang komprehensif:

- ✅ **Platform Digital** - Warga dapat mengajukan pengaduan kapan saja, di mana saja
- ✅ **Real-time Tracking** - Status pengaduan dapat dipantau secara real-time (PENDING → PROSES → SELESAI)
- ✅ **Role-Based Access** - Sistem dengan 4 level akses (Admin, Ketua RT, RT, Warga)
- ✅ **Dokumentasi Lengkap** - Semua pengaduan tercatat dengan bukti foto dan timestamp

---

## 🏗 Technical Architecture

### Tech Stack

<table>
<tr>
<td align="center" width="200">

**Frontend**

</td>
<td align="center" width="200">

**Backend & Database**

</td>
<td align="center" width="200">

**Styling**

</td>
<td align="center" width="200">

**DevOps**

</td>
</tr>
<tr>
<td align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)

</td>
<td align="center">

![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)

</td>
<td align="center">

![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Shadcn/UI](https://img.shields.io/badge/Shadcn/UI-000000?style=flat&logo=shadcnui&logoColor=white)

</td>
<td align="center">

![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white)

</td>
</tr>
</table>

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
│                         DOMAIN LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Types     │  │    Utils    │  │     Validations         │  │
│  │ (Profiles,  │  │   (lib/)    │  │   (Role-based)          │  │
│  │  Tickets)   │  │             │  │                         │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
└─────────┼────────────────┼──────────────────────┼───────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Supabase Client                          ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ ││
│  │  │   Auth    │  │  Database │  │  Storage  │  │   RLS    │ ││
│  │  └───────────┘  └───────────┘  └───────────┘  └──────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
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
│   │   ├── 📁 admin/        # Admin dashboard
│   │   ├── 📁 dashboard/    # User dashboard
│   │   ├── 📁 login/        # Authentication
│   │   └── 📁 register/     # User registration
│   ├── 📁 components/
│   │   └── 📁 ui/           # Shadcn UI components
│   ├── 📁 hooks/            # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   └── useToast.tsx     # Toast notifications
│   ├── 📁 lib/              # Utility functions
│   └── 📁 utils/            # Supabase clients
├── 📄 .env.example          # Environment template
├── 📄 package.json          # Dependencies
├── 📄 tailwind.config.ts    # Tailwind configuration
├── 📄 tsconfig.json         # TypeScript config
└── 📄 README.md             # Documentation
```

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Sistem autentikasi aman dengan Supabase Auth |
| 👥 **Role-Based Access Control** | 4 level user (Admin, Ketua RT, RT, Warga) dengan permissions berbeda |
| 📝 **Ticket Management** | CRUD operasi lengkap untuk pengaduan warga |
| 🖼️ **Image Upload** | Dukungan upload foto sebagai bukti pengaduan |
| 📊 **Status Tracking** | Tracking status real-time (PENDING → PROSES → SELESAI) |
| 📱 **Responsive Design** | Mobile-first design, optimal di semua perangkat |
| 🔒 **Row Level Security** | Keamanan data dengan Supabase RLS policies |
| ⚡ **Server Components** | Performa optimal dengan React Server Components |

---

## 🚀 Getting Started

### Prerequisites

Pastikan Anda sudah menginstall:

| Requirement | Version | Installation Guide |
|-------------|---------|-------------------|
| Node.js | >= 18.x | [nodejs.org](https://nodejs.org/) |
| npm / yarn / pnpm | Latest | Included with Node.js |
| Git | >= 2.x | [git-scm.com](https://git-scm.com/) |
| Supabase Account | - | [supabase.com](https://supabase.com/) |

```bash
# Verify installations
node --version
npm --version
git --version
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
<summary>📊 Profiles Table</summary>

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

</details>

<details>
<summary>🎫 Tickets Table</summary>

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

</details>

---

## 📖 Usage

### User Roles & Permissions

| Role | Route | View Tickets | Create | Update Status | Delete |
|------|:-----:|:------------:|:------:|:-------------:|:------:|
| **Admin** | `/admin` | ✅ All | ❌ | ✅ | ✅ |
| **Ketua RT** | `/admin` | ✅ All | ❌ | ✅ | ❌ |
| **RT** | `/admin` | ✅ All | ❌ | ❌ | ❌ |
| **Warga** | `/dashboard` | Own only | ✅ | ❌ | ❌ |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👤 Warga | usersapa123@gmail.com | usersapa123 |
| 🔑 Admin | adminsapa123@gmail.com | adminsapa123 |
| 📋 RT | pakrt123@gmail.com | pakrt123 |
| 👑 Ketua RT | ketuart@gmail.com | ketuart123 |

> ⚠️ **Warning:** Kredensial ini hanya untuk demo. Jangan gunakan di production.

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

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign Out

```typescript
const { error } = await supabase.auth.signOut();
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
    title: 'Judul Pengaduan',
    description: 'Deskripsi lengkap...',
    user_id: userId,
    user_email: userEmail,
  });
```

### Update Ticket Status

```typescript
const { data, error } = await supabase
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

### Environment Variables on Vercel

Tambahkan environment variables berikut di Vercel Dashboard:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |

---

## 🗺️ Roadmap

### Version 1.0 (Current) ✅
- [x] Sistem autentikasi dengan Supabase
- [x] CRUD operasi untuk tickets
- [x] Role-based access control
- [x] Responsive UI dengan Tailwind CSS
- [x] Upload gambar untuk bukti

### Version 1.1 (Planned)
- [ ] Notifikasi real-time
- [ ] Email notification saat status berubah
- [ ] Dashboard analytics untuk Admin
- [ ] Export laporan ke PDF

### Version 2.0 (Future)
- [ ] Push notifications
- [ ] Chat langsung dengan RT
- [ ] Multi-bahasa (i18n)
- [ ] Dark mode

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

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made by Andrian

</div>
