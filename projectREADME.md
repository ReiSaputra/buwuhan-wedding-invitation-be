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
└── invitation/
    └── invitation.test.ts  # 14 test, semua lolos
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
  publishedAt, eventDate, eventTime, venue, address, additionalInfo (Json),
  relasi ke owner (`User`), optional `Template`, `Couple[]`, `Guest[]`, `RSVP[]`, `GalleryPhoto[]`, dan `LoveStory[]`
- **Couple**: name, type (enum `CoupleType`: BRIDE/GROOM), fatherName, motherName
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

| Method | Path                                     | Body                                      | Auth                      |
| ------ | ---------------------------------------- | ----------------------------------------- | ------------------------- |
| GET    | `/public/invitations/:slug`              | —                                         | publik (ACTIVE/COMPLETED) |
| POST   | `/invitations`                           | `{ title, slug, eventDate, couples, ...}` | `requireAuth`             |
| GET    | `/invitations`                           | —                                         | `requireAuth`             |
| GET    | `/invitations/:id`                       | —                                         | `requireAuth` (owner)     |
| PATCH  | `/invitations/:id`                       | field yang diubah (partial)               | `requireAuth` (owner)     |
| PATCH  | `/invitations/:id/status`                | `{ status: InvitationStatus }`            | `requireAuth` (owner)     |
| DELETE | `/invitations/:id`                       | —                                         | `requireAuth` (owner)     |
| POST   | `/invitations/:invitationId/gallery`     | `{ imageUrl, caption?, order? }`          | `requireAuth` (owner)     |
| PATCH  | `/invitations/:invitationId/gallery/:id` | `{ imageUrl?, caption?, order? }`         | `requireAuth` (owner)     |
| DELETE | `/invitations/:invitationId/gallery/:id` | —                                         | `requireAuth` (owner)     |
| POST   | `/invitations/:invitationId/stories`     | `{ yearOrDate, title, story, imageUrl?}`  | `requireAuth` (owner)     |
| PATCH  | `/invitations/:invitationId/stories/:id` | `{ yearOrDate?, title?, story?, ... }`    | `requireAuth` (owner)     |
| DELETE | `/invitations/:invitationId/stories/:id` | —                                         | `requireAuth` (owner)     |

- Testing: **16 test lolos** di `tests/invitation/invitation.test.ts`.

## 7. Modul Template — SUDAH SELESAI

Lokasi: `src/modules/template/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path               | Body                                    | Auth                                   |
| ------ | ------------------ | --------------------------------------- | -------------------------------------- |
| GET    | `/templates`       | —                                       | `requireAuth`                          |
| GET    | `/templates/:slug` | —                                       | `requireAuth`                          |
| POST   | `/templates`       | `{ name, slug, tier, previewImageUrl }` | `requireAuth` + `requireRole("ADMIN")` |
| PATCH  | `/templates/:id`   | field yang diubah (partial)             | `requireAuth` + `requireRole("ADMIN")` |
| DELETE | `/templates/:id`   | —                                       | `requireAuth` + `requireRole("ADMIN")` |

## 8. Modul Guest (Manajemen Tamu & Presensi QR) — SUDAH SELESAI

Lokasi: `src/modules/guest/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path                                              | Body                                               | Auth                  |
| ------ | ------------------------------------------------- | -------------------------------------------------- | --------------------- |
| GET    | `/public/invitations/:slug/guests/verify/:qrCode` | —                                                  | publik (scanner)      |
| POST   | `/invitations/:invitationId/guests`               | `{ name, category, phone, email, notes, paxCount}` | `requireAuth` (owner) |
| POST   | `/invitations/:invitationId/guests/bulk`          | `{ guests: [...] }`                                | `requireAuth` (owner) |
| GET    | `/invitations/:invitationId/guests`               | Query: `?category=&isAttended=&search=`            | `requireAuth` (owner) |
| GET    | `/invitations/:invitationId/guests/stats`         | —                                                  | `requireAuth` (owner) |
| GET    | `/invitations/:invitationId/guests/:id`           | —                                                  | `requireAuth` (owner) |
| PATCH  | `/invitations/:invitationId/guests/:id`           | `{ name, category, phone, email, notes, ... }`     | `requireAuth` (owner) |
| DELETE | `/invitations/:invitationId/guests/:id`           | —                                                  | `requireAuth` (owner) |
| POST   | `/invitations/:invitationId/guests/check-in`      | `{ qrCode?, guestId?, paxActual? }`                | `requireAuth` (owner) |
| POST   | `/invitations/:invitationId/guests/check-out`     | `{ qrCode?, guestId? }`                            | `requireAuth` (owner) |

- Testing: **17 test lolos** di `tests/guest/guest.test.ts`.

## 9. Modul RSVP (Konfirmasi Kehadiran & Buku Tamu Digital) — SUDAH SELESAI

Lokasi: `src/modules/rsvp/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path                                     | Body                                               | Auth                  |
| ------ | ---------------------------------------- | -------------------------------------------------- | --------------------- |
| POST   | `/public/invitations/:slug/rsvp`         | `{ qrCode?, name?, status, reservation, message }` | publik                |
| GET    | `/public/invitations/:slug/wishes`       | Query: `?limit=&page=`                             | publik                |
| GET    | `/invitations/:invitationId/rsvps`       | Query: `?status=&search=`                          | `requireAuth` (owner) |
| GET    | `/invitations/:invitationId/rsvps/stats` | —                                                  | `requireAuth` (owner) |
| DELETE | `/invitations/:invitationId/rsvps/:id`   | —                                                  | `requireAuth` (owner) |

- Testing: **14 test lolos** di `tests/rsvp/rsvp.test.ts`.

## 10. Modul User — SUDAH SELESAI

Lokasi: `src/modules/user/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path        | Body | Auth          |
| ------ | ----------- | ---- | ------------- |
| GET    | `/users/me` | —    | `requireAuth` |

- Testing: **3 test lolos** di `tests/user/user.test.ts`.

## 11. Modul Dashboard — SUDAH SELESAI

Lokasi: `src/modules/dashboard/`. Terdaftar di `v1Router`.

### Endpoint (semua di bawah prefix `/v1/api`)

| Method | Path         | Body | Auth          |
| ------ | ------------ | ---- | ------------- |
| GET    | `/dashboard` | —    | `requireAuth` |

- Testing: **4 test lolos** di `tests/dashboard/dashboard.test.ts`.

## 12. Middleware & Error Handling

- `requireAuth`: Memvalidasi JWT di header `Authorization: Bearer <token>` dan mengisi `req.user: AuthUser` (`{ id, role, planTier }`).
- `requireRole(...roles)`: RBAC sederhana (contoh admin template).
- Error classes: `AppError`, `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `ValidationError` (422).

## 13. Dokumentasi API (Swagger)

- Definisi dasar: `src/config/swagger.config.ts`
- File anotasi JSDoc:
  - `src/modules/auth/auth.docs.ts`
  - `src/modules/invitation/invitation.docs.ts`
  - `src/modules/template/template.docs.ts`
  - `src/modules/guest/guest.docs.ts`
  - `src/modules/rsvp/rsvp.docs.ts`
  - `src/modules/user/user.docs.ts`
  - `src/modules/dashboard/dashboard.docs.ts`

## 14. Status Pengerjaan & Belum Dikerjakan

| Modul / Fitur              | Status                                         |
| -------------------------- | ---------------------------------------------- |
| Modul `auth`               | Selesai (17 test lolos)                        |
| Modul `invitation`         | Selesai (16 test lolos)                        |
| Modul `template`           | Selesai (API & Router siap)                    |
| Modul `guest`              | Selesai (17 test lolos)                        |
| Modul `rsvp`               | Selesai (14 test lolos)                        |
| Modul `user`               | Selesai (3 test lolos)                         |
| Modul `dashboard`          | Selesai (4 test lolos)                         |
| Test modul `template`      | Belum ada                                      |
| Fitur buwuhan              | Masih rencana, belum ada di schema maupun kode |
| Integrasi Email Provider   | Utang teknis modul guest (lihat §8)            |
| Reuse detection penuh      | Utang teknis auth (lihat §5)                   |
| Endpoint logout-all-device | Utang teknis auth (lihat §5)                   |

## 15. Cara Melanjutkan

1. **Ikuti pola modul yang sudah ada (`auth`, `invitation`, `guest`, `rsvp`, `user`, `dashboard`)** sebagai referensi struktur (controller → service → repository → routes → types → schema → docs).
2. **Testing**: Gunakan `vi.spyOn`, bukan `vi.mock()`. Rate limiter otomatis nonaktif saat `NODE_ENV=test`.
3. **Route prefix**: Semua endpoint terdaftar di bawah `/v1/api/...`.
