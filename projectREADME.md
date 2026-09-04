# Buwuhan Wedding Invitation — Konteks Project

> Dokumen ini dibuat untuk memberi konteks ke AI assistant (Claude atau lainnya) yang akan
> melanjutkan pengerjaan project ini, supaya tidak perlu tanya ulang dari nol soal apa yang
> sudah dikerjakan dan keputusan teknis apa yang sudah diambil.

## 1. Tentang Project

Aplikasi web **undangan digital pernikahan**. User bisa membuat & mengatur undangan mereka
sendiri, memilih template undangan, mengelola galeri foto & cerita perjalanan cinta (love story),
mengelola daftar tamu & presensi (QR check-in/out), menerima konfirmasi kehadiran & ucapan
tamu (**RSVP & Buku Tamu Digital**), serta ada fitur **gift** (uang yang diberikan langsung
saat acara) yang nantinya akan dibedakan dari konsep **buwuhan** (bantuan berupa barang yang
dicatat sebagai nominal uang hasil konversi barang tersebut) — fitur buwuhan ini masih rencana,
belum diimplementasikan.

Pendekatan pengembangan: mulai dari schema Prisma yang minimal dulu, fitur kompleks (multi-owner
undangan, plan/subscription, dsb) baru ditambahkan skema-nya saat fitur itu benar-benar mau
dibangun — bukan didesain di awal.

## 2. Tech Stack

- **Node.js + TypeScript + Express**
- **Prisma** (`PrismaPg` adapter) dengan datasource **PostgreSQL**, generator client custom ke
  `src/generated/prisma` (di-gitignore, di-generate ulang via `prisma generate`)
- **JWT** (`jsonwebtoken`) untuk access token
- **Refresh token**: random string (bukan JWT), di-hash SHA-256, disimpan di tabel `Session`,
  dikirim ke client lewat **httpOnly cookie**
- **bcrypt** untuk hashing password
- **Zod** untuk validasi input (middleware `validate(schema)`)
- **express-rate-limit** untuk rate limiting endpoint auth
- **Winston** (+ `winston-daily-rotate-file`) untuk logging, termasuk logging query Prisma
- **Vitest + Supertest** untuk testing
- **swagger-jsdoc + swagger-ui-express** untuk dokumentasi API interaktif

## 3. Struktur Folder

```
src/
├── config/           # termasuk swagger.config.ts
├── errors/           # AppError, ConflictError, UnauthorizedError, ValidationError, NotFoundError, ForbiddenError
├── generated/        # Prisma client (gitignored)
├── lib/              # prisma client instance (dengan Winston logging ter-attach)
├── middlewares/      # error.middleware.ts, validate.middleware.ts, rate-limit.middleware.ts,
│                     # auth.middleware.ts (requireAuth + AuthUser interface),
│                     # role.middleware.ts (requireRole — RBAC sederhana)
├── modules/
│   ├── auth/         # controller, service, repository, routes, types, validation, cookie helper, docs -- SELESAI (§5)
│   ├── invitation/   # controller, service, repository, routes, types, validation, docs -- SELESAI (§6)
│   ├── template/     # controller, service, repository, routes, types, validation, docs -- SELESAI (§7)
│   ├── guest/        # controller, service, repository, routes, types, validation, docs -- SELESAI (§8)
│   ├── rsvp/         # controller, service, repository, routes, types, validation, docs -- SELESAI (§9)
│   └── user/         # (kosong — belum dikerjakan)
├── routes/
│   └── v1/           # index.ts gabungan semua router modul, di-mount app.use("/v1", v1Router)
├── utils/            # termasuk log.ts (Winston config)
├── app.ts
└── server.ts

tests/
├── auth/
│   └── auth.test.ts        # 17 test, semua lolos
├── guest/
│   └── guest.test.ts       # 17 test, semua lolos
├── rsvp/
│   └── rsvp.test.ts        # 14 test, semua lolos
├── invitation/
│   └── invitation.test.ts  # 23 test, semua lolos
└── template/
    └── template.test.ts    # 20 test, semua lolos

docs/
└── template-slug-contract.md  # Kontrak publik slug template (lihat §7)
```

Pola per modul: **controller** (Express handler, cuma parsing request & panggil service) →
**service** (business logic) → **repository** (akses Prisma). Response API format konsisten:

```json
// Sukses
{ "message": "...", "status": 200, "data": { ... } }

// Error (dari errorHandler global)
{ "success": false, "message": "..." }
```

## 4. Schema Database (Prisma) — ringkas

- **User**: id (cuid), fullName, email (unique, citext), passwordHash,
  role (enum `PlatformRole`: USER/ADMIN), planTier (enum `PlanTier`: FREE/PRO/MAX),
  relasi ke `sessions` dan `invitations`
- **Template**: name, slug (unique), tier (`PlanTier`), previewImageUrl, isActive (soft-delete),
  relasi ke `invitations`
- **Invitation**: title, slug (unique), status (enum `InvitationStatus`: DRAFT/ACTIVE/COMPLETED),
  eventCategory (enum `EventCategory`: WEDDING/KHITANAN/RASULAN/AQIQAH, default: WEDDING),
  publishedAt, eventDate, eventTime, venue, address, additionalInfo (Json),
  relasi ke owner (`User`), optional `Template`, `Couple[]`, `Guest[]`, `RSVP[]`, `GalleryPhoto[]`, dan `LoveStory[]`
- **Template**: name, slug (unique), tier (enum `PlanTier`: FREE/PRO/MAX),
  eventCategory (enum `EventCategory`: WEDDING/KHITANAN/RASULAN/AQIQAH, default: WEDDING),
  previewImageUrl, isActive (Boolean)
- **Couple**: name, type (enum `CoupleType`: BRIDE/GROOM), fatherName, motherName (khusus kategori `WEDDING`, dikontrol via flag `showCouples`)
- **GalleryPhoto**: imageUrl, caption, order, relasi ke `Invitation` (Cascade delete)
- **LoveStory**: yearOrDate, title, story, imageUrl, order, relasi ke `Invitation` (Cascade delete)
- **Guest**: name, category (Keluarga/Saudara/Rekan Kerja/Teman/VIP/Publik), phone, email, notes,
  qrCode (unique token acak), paxCount, paxActual, isAttended, checkedInAt, checkedOutAt,
  relasi ke `Invitation` (Cascade delete), punya relasi ke `RSVP`
- **RSVP**: status (enum `RSVPStatus`: CONFIRMED/DECLINED), reservation (Int), message (Text doa restu/ucapan),
  relasi ke `Guest` dan `Invitation` (Cascade delete), `@@unique([invitationId, guestId])`
- **Session**: userId, refreshTokenHash (unique), userAgent, ipAddress, revokedAt, expiresAt —
  untuk refresh token rotation

## 5. Modul Auth — SUDAH SELESAI

Lokasi: `src/modules/auth/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path                  | Body                            | Rate limit    | Auth                |
| ------ | --------------------- | ------------------------------- | ------------- | ------------------- |
| POST   | `/auth/register`      | `{ fullName, email, password }` | 5 / jam       | publik              |
| POST   | `/auth/login`         | `{ email, password }`           | 10 / 15 menit | publik              |
| POST   | `/auth/refresh-token` | tanpa body                      | 30 / 15 menit | cookie refreshToken |
| POST   | `/auth/logout`        | tanpa body                      | tidak ada     | cookie (opsional)   |

- Testing: **17 test lolos** di `tests/auth/auth.test.ts`.

## 6. Modul Invitation (termasuk Galeri & Love Story) — SUDAH SELESAI

Lokasi: `src/modules/invitation/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path                                     | Body                                                       | Auth                                   |
| ------ | ---------------------------------------- | ---------------------------------------------------------- | -------------------------------------- |
| GET    | `/public/invitations/:slug`              | —                                                          | publik (ACTIVE/COMPLETED)              |
| POST   | `/invitations`                           | `{ title, slug, eventCategory?, eventDate, couples?, ...}` | `requireAuth`                          |
| GET    | `/invitations`                           | —                                                          | `requireAuth`                          |
| GET    | `/invitations/:id`                       | —                                                          | `requireAuth` (owner)                  |
| PATCH  | `/invitations/:id`                       | field yang diubah (partial)                                | `requireAuth` (owner)                  |
| PATCH  | `/invitations/:id/status`                | `{ status: InvitationStatus }`                             | `requireAuth` (owner)                  |
| DELETE | `/invitations/:id`                       | —                                                          | `requireAuth` (owner)                  |
| POST   | `/invitations/:invitationId/gallery`     | `{ imageUrl, caption?, order? }`                           | `requireAuth` (owner)                  |
| PATCH  | `/invitations/:invitationId/gallery/:id` | `{ imageUrl?, caption?, order? }`                          | `requireAuth` (owner)                  |
| DELETE | `/invitations/:invitationId/gallery/:id` | —                                                          | `requireAuth` (owner)                  |
| POST   | `/invitations/:invitationId/stories`     | `{ yearOrDate, title, story, imageUrl?}`                   | `requireAuth` (owner)                  |
| PATCH  | `/invitations/:invitationId/stories/:id` | `{ yearOrDate?, title?, story?, ... }`                     | `requireAuth` (owner)                  |
| DELETE | `/invitations/:invitationId/stories/:id` | —                                                          | `requireAuth` (owner)                  |
| GET    | `/admin/invitations`                     | `?page&limit&search...`                                    | `requireAuth` + `requireRole("ADMIN")` |
| GET    | `/admin/invitations/:id`                 | —                                                          | `requireAuth` + `requireRole("ADMIN")` |
| PATCH  | `/admin/invitations/:id/status`          | `{ status }`                                               | `requireAuth` + `requireRole("ADMIN")` |

> **Catatan penting untuk integrasi frontend:**
>
> - Endpoint halaman undangan publik adalah **`GET /v1/api/public/invitations/:slug`** (tanpa
>   autentikasi). Bukan `GET /v1/api/invitations/:id` — endpoint itu terpasang `requireAuth`
>   dan hanya bisa diakses oleh pemilik undangan.
> - Response endpoint publik **tidak** memuat field `templateId` di level atas. Template
>   dikembalikan sebagai objek bersarang:
>   ```json
>   "template": { "id": "...", "name": "...", "slug": "..." }
>   ```
>   dan bernilai `null` bila undangan belum memilih template (frontend mengandalkan ini untuk
>   jatuh ke desain bawaan).

- Testing: **38 test lolos** di `tests/invitation/invitation.test.ts`.

## 7. Modul Template — SUDAH SELESAI

Lokasi: `src/modules/template/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path                           | Body                                    | Auth                                   |
| ------ | ------------------------------ | --------------------------------------- | -------------------------------------- |
| GET    | `/templates`                   | —                                       | `requireAuth`                          |
| GET    | `/templates/:slug`             | —                                       | `requireAuth`                          |
| POST   | `/templates`                   | `{ name, slug, tier, previewImageUrl }` | `requireAuth` + `requireRole("ADMIN")` |
| PATCH  | `/templates/:id`               | field yang diubah (partial)             | `requireAuth` + `requireRole("ADMIN")` |
| DELETE | `/templates/:id`               | —                                       | `requireAuth` + `requireRole("ADMIN")` |
| GET    | `/admin/templates`             | `?isActive&tier&category...`            | `requireAuth` + `requireRole("ADMIN")` |
| PATCH  | `/admin/templates/:id/restore` | —                                       | `requireAuth` + `requireRole("ADMIN")` |

> **Kontrak slug:** Field `template.slug` adalah **kontrak publik** antara backend dan frontend.
> Frontend memilih komponen template React berdasarkan nilai slug ini, sehingga slug bersifat
> **immutable** setelah rilis. Lihat [`docs/template-slug-contract.md`](docs/template-slug-contract.md)
> untuk daftar slug terdaftar dan aturan perubahannya.

- Testing: **26 test lolos** di `tests/template/template.test.ts`.

## 8. Modul Guest (Manajemen Tamu & Presensi QR) — SUDAH SELESAI

Lokasi: `src/modules/guest/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path                                                | Body                                             | Auth                  |
| ------ | --------------------------------------------------- | ------------------------------------------------ | --------------------- |
| GET    | `/public/invitations/:slug/guests/verify/:qrCode`   | —                                                | publik (baca QR tamu) |
| POST   | `/invitations/:invitationId/guests`                 | `{ name, category, phone?, email?, notes? }`     | `requireAuth` (owner) |
| POST   | `/invitations/:invitationId/guests/bulk`            | `[{ name, category, ... }]`                      | `requireAuth` (owner) |
| GET    | `/invitations/:invitationId/guests`                 | `?category=...&isAttended=...`                   | `requireAuth` (owner) |
| GET    | `/invitations/:invitationId/guests/stats`           | —                                                | `requireAuth` (owner) |
| GET    | `/invitations/:invitationId/guests/:id`             | —                                                | `requireAuth` (owner) |
| PATCH  | `/invitations/:invitationId/guests/:id`             | field yang diubah (partial)                      | `requireAuth` (owner) |
| DELETE | `/invitations/:invitationId/guests/:id`             | —                                                | `requireAuth` (owner) |
| POST   | `/invitations/:invitationId/guests/check-in`        | `{ qrCode }` ATAU `{ guestId, paxActual?, ... }` | `requireAuth` (owner) |
| POST   | `/invitations/:invitationId/guests/check-out`       | `{ guestId }`                                    | `requireAuth` (owner) |
| POST   | `/invitations/:invitationId/guests/:id/send-email`  | —                                                | `requireAuth` (owner) |
| POST   | `/invitations/:invitationId/guests/send-email-bulk` | `{ guestIds?: string[] }`                        | `requireAuth` (owner) |
| GET    | `/invitations/:invitationId/guests/:id/share`       | —                                                | `requireAuth` (owner) |

> **Fitur Share & Email Tamu:**
>
> - **WhatsApp Share URL**: Tautan langsung chat WA (`https://api.whatsapp.com/send?phone=628xxx&text=...`) maupun share universal (`?text=...`) yang memuat link personal tamu (`/invitation/:slug?to=:qrCode`).
> - **Email Provider**: Pengiriman email undangan digital + kode tiket presensi personal menggunakan SMTP/Nodemailer (single & bulk).

- Testing: **24 test lolos** di `tests/guest/guest.test.ts`.

## 9. Modul RSVP & Buku Tamu Ucapan — SUDAH SELESAI

Lokasi: `src/modules/rsvp/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path                                     | Body                                 | Auth                      |
| ------ | ---------------------------------------- | ------------------------------------ | ------------------------- |
| POST   | `/public/invitations/:slug/rsvp`         | `{ guestId, status, message?, ... }` | publik (ACTIVE/COMPLETED) |
| GET    | `/public/invitations/:slug/wishes`       | —                                    | publik (ACTIVE/COMPLETED) |
| GET    | `/invitations/:invitationId/rsvps`       | —                                    | `requireAuth` (owner)     |
| GET    | `/invitations/:invitationId/rsvps/stats` | —                                    | `requireAuth` (owner)     |
| DELETE | `/invitations/:invitationId/rsvps/:id`   | —                                    | `requireAuth` (owner)     |

- Testing: **14 test lolos** di `tests/rsvp/rsvp.test.ts`.

## 10. Modul User (Profil & Admin User Management) — SUDAH SELESAI

Lokasi: `src/modules/user/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path                               | Body                    | Auth                                   |
| ------ | ---------------------------------- | ----------------------- | -------------------------------------- |
| GET    | `/users/me`                        | —                       | `requireAuth`                          |
| GET    | `/admin/users`                     | `?page&limit&search...` | `requireAuth` + `requireRole("ADMIN")` |
| GET    | `/admin/users/:id`                 | —                       | `requireAuth` + `requireRole("ADMIN")` |
| PATCH  | `/admin/users/:id/tier`            | `{ planTier }`          | `requireAuth` + `requireRole("ADMIN")` |
| PATCH  | `/admin/users/:id/role`            | `{ role }`              | `requireAuth` + `requireRole("ADMIN")` |
| POST   | `/admin/users/:id/revoke-sessions` | —                       | `requireAuth` + `requireRole("ADMIN")` |
| DELETE | `/admin/users/:id`                 | —                       | `requireAuth` + `requireRole("ADMIN")` |

- Testing: **28 test lolos** di `tests/user/user.test.ts`.

## 11. Modul Dashboard (Host & Admin Platform Analytics) — SUDAH SELESAI

Lokasi: `src/modules/dashboard/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path                     | Body | Auth                                   |
| ------ | ------------------------ | ---- | -------------------------------------- |
| GET    | `/dashboard`             | —    | `requireAuth`                          |
| GET    | `/admin/dashboard/stats` | —    | `requireAuth` + `requireRole("ADMIN")` |

- Testing: **7 test lolos** di `tests/dashboard/dashboard.test.ts`.

## 12. Modul Buwuhan (Catatan Buwuh) — SUDAH SELESAI

Lokasi: `src/modules/buwuhan/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path                                          | Body                                               | Auth                  |
| ------ | --------------------------------------------- | -------------------------------------------------- | --------------------- |
| GET    | `/buwuhans`                                   | —                                                  | `requireAuth` (owner) |
| POST   | `/invitations/:invitationId/buwuhans`         | `{ giverName, note?, receivedAt?, items: [...] }`  | `requireAuth` (owner) |
| GET    | `/invitations/:invitationId/buwuhans`         | —                                                  | `requireAuth` (owner) |
| GET    | `/invitations/:invitationId/buwuhans/summary` | —                                                  | `requireAuth` (owner) |
| GET    | `/buwuhans/:id`                               | —                                                  | `requireAuth` (owner) |
| PATCH  | `/buwuhans/:id`                               | `{ giverName?, note?, receivedAt?, items?: [...]}` | `requireAuth` (owner) |
| DELETE | `/buwuhans/:id`                               | —                                                  | `requireAuth` (owner) |

#### Contoh Respon `GET /v1/api/buwuhans` (200 OK)

```json
{
  "message": "Daftar buwuh berhasil diambil",
  "status": 200,
  "data": [
    {
      "id": "cly3k9h2p0000v8og3f1a9x00",
      "invitationId": "cly3k8a1b0000v8og3f1a1111",
      "invitationTitle": "Han & Saputra",
      "invitationSlug": "han-saputra",
      "giverName": "H. Ahmad & Keluarga",
      "note": "Selamat menempuh hidup baru",
      "receivedAt": "2026-08-21T13:15:00.000Z",
      "createdAt": "2026-08-21T13:15:00.000Z",
      "updatedAt": "2026-08-21T13:15:00.000Z",
      "items": [
        {
          "id": "cly3k9h2p0000v8og3f1a9x01",
          "buwuhanId": "cly3k9h2p0000v8og3f1a9x00",
          "itemName": "Beras",
          "quantity": 50,
          "unit": "kg",
          "category": "Sembako",
          "estimatedValue": 650000,
          "createdAt": "2026-08-21T13:15:00.000Z"
        }
      ]
    }
  ]
}
```

- Testing: **25 test lolos** di `tests/buwuhan/buwuhan.test.ts`.

## 13. Middleware & Error Handling

- `requireAuth`: Memvalidasi JWT di header `Authorization: Bearer <token>` dan mengisi `req.user: AuthUser` (`{ id, role, planTier }`).
- `requireRole(...roles)`: RBAC sederhana (contoh admin template).
- Error classes: `AppError`, `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `ValidationError` (422).

## 14. Dokumentasi API (Swagger)

- Definisi dasar: `src/config/swagger.config.ts`
- File anotasi JSDoc:
  - `src/modules/auth/auth.docs.ts`
  - `src/modules/invitation/invitation.docs.ts`
  - `src/modules/template/template.docs.ts`
  - `src/modules/guest/guest.docs.ts`
  - `src/modules/rsvp/rsvp.docs.ts`
  - `src/modules/user/user.docs.ts`
  - `src/modules/dashboard/dashboard.docs.ts`
  - `src/modules/buwuhan/buwuhan.docs.ts`

## 15. Status Pengerjaan & Belum Dikerjakan

| Modul / Fitur              | Status                                                    |
| -------------------------- | --------------------------------------------------------- |
| Modul `auth`               | Selesai (17 test lolos)                                   |
| Modul `invitation`         | Selesai (38 test lolos - Host & Admin Moderasi)           |
| Modul `template`           | Selesai (26 test lolos - Katalog & Restore)               |
| Modul `guest`              | Selesai (24 test lolos)                                   |
| Modul `rsvp`               | Selesai (14 test lolos)                                   |
| Modul `user`               | Selesai (28 test lolos - Admin Role, Tier, Sesi & Delete) |
| Modul `dashboard`          | Selesai (7 test lolos - Host & Admin Analytics)           |
| Modul `buwuhan`            | Selesai (25 test lolos)                                   |
| Integrasi Email & WA Share | Selesai (Nodemailer SMTP & WA link)                       |
| Reuse detection penuh      | Utang teknis auth (lihat §5)                              |
| Endpoint logout-all-device | Utang teknis auth (lihat §5)                              |

## 16. Cara Melanjutkan

1. **Ikuti pola modul yang sudah ada (`auth`, `invitation`, `guest`, `rsvp`, `user`, `dashboard`, `buwuhan`)** sebagai referensi struktur (controller → service → repository → routes → types → schema → docs).
2. **Testing**: Gunakan `vi.spyOn`, bukan `vi.mock()`. Rate limiter otomatis nonaktif saat `NODE_ENV=test`.
3. **Route prefix**: Semua endpoint terdaftar di bawah `/v1/api/...`.
