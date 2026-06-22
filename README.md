# Beasiswa Tracker

Aplikasi pelacak beasiswa untuk mahasiswa Indonesia yang apply ke universitas luar negeri.

---

## PENTING BUAT ANTIGRAVITY — BACA INI DULU

Versi ini pakai **localStorage** (data disimpan di browser masing-masing orang).
Masalahnya: kalau ownernya edit di browsernya, orang lain yang buka link yang sama **ga bakal lihat** perubahannya — karena tiap orang punya storage sendiri.

**Yang perlu lo tambahkan:** backend + database biar data disimpan di server, bukan di browser.
Jadi kalau ownernya edit, semua orang yang buka link yang sama langsung lihat versi terbaru.

### Solusi yang disarankan (buat deploy di GitHub/server):

Ganti localStorage dengan API calls ke backend. Struktur yang paling simpel:

```
Frontend (React) ──► API (Node/Express atau Next.js API routes)
                          │
                          ▼
                     Database (PostgreSQL / MongoDB / SQLite)
```

### Data yang perlu dipindah ke DB:

| localStorage key saat ini | Jadi tabel/collection |
|--------------------------|----------------------|
| `beasiswa_universities`  | `universities`       |
| `beasiswa_goals`         | `goals`              |
| `beasiswa_cv`            | `cv`                 |
| `beasiswa_documents`     | `documents`          |

### File yang perlu diubah:

- `src/store/data.ts` — ganti fungsi `getUniversities()`, `saveUniversities()`, dll dari localStorage ke `fetch('/api/universities')`.
- Semua page (`Universities.tsx`, `Goals.tsx`, `CVEditor.tsx`, `Documents.tsx`) sudah pakai fungsi dari `data.ts`, jadi kalau `data.ts`-nya diubah, page-nya ikut otomatis.

### Yang TIDAK perlu diubah:

- Semua komponen UI (`src/pages/`, `src/components/`) — bisa dipakai as-is
- Routing (`App.tsx`) — sama aja
- Styling (Tailwind, shadcn) — sama aja
- Types (`src/types.ts`) — sama aja, tinggal pakai buat validasi di backend juga

### Stack rekomendasi buat backend-nya:

**Option A (paling simpel — Next.js fullstack):**
- Pindahin semua ke Next.js, pakai API routes bawaan Next
- Database: PostgreSQL (Supabase free tier) atau SQLite (buat lokal)

**Option B (Express terpisah):**
- Frontend: React + Vite (sudah ada, tinggal pakai)
- Backend: Express.js + Prisma ORM
- Database: PostgreSQL

### Catatan dokumen (Documents/Berkas):

Saat ini file dokumen disimpan sebagai base64 string di localStorage.
Untuk versi backend, sebaiknya pakai file storage (S3, Cloudflare R2, atau simpan di disk server) dan simpan URL-nya aja di database — bukan base64-nya.

---

## Stack saat ini (frontend only)

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Wouter (routing)
- date-fns + lucide-react
- localStorage (NO backend)

## Cara run (versi sekarang)

```bash
npm install
npm run dev
```

Buka http://localhost:5173

## Struktur file

```
src/
├── App.tsx              # Root app, sidebar, routing, export/import
├── types.ts             # Semua TypeScript types (University, Goal, CV, dll)
├── index.css            # Global styles + print styles untuk CV
├── pages/
│   ├── Dashboard.tsx    # Halaman utama (stats, upcoming deadlines)
│   ├── Universities.tsx # Tabel universitas + detail sheet + add/edit/delete
│   ├── Calendar.tsx     # Kalender deadline & goals
│   ├── Goals.tsx        # Goals dengan auto-priority scoring
│   ├── Documents.tsx    # Upload & manage dokumen (Berkas)
│   └── CVEditor.tsx     # Form CV + live preview + print
├── store/
│   └── data.ts          # ← GANTI INI ke API calls kalau mau backend
└── lib/
    └── scoring.ts       # Rumus priority scoring goals
```

## Seed data

Di `src/store/data.ts` ada 7 universitas default (UCB, CMU, USyd, UofT, Tsinghua, Kyoto, Purdue).
Bisa dihapus atau diganti dengan data dari database.
