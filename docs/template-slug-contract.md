# Template Slug — Kontrak Publik

> **Status:** Kontrak aktif. Dokumen ini adalah satu-satunya sumber kebenaran (_single source of
> truth_) untuk daftar slug template yang sah. Setiap perubahan pada tabel ini **wajib**
> dikomunikasikan ke tim frontend sebelum dilakukan.

## Daftar Slug yang Terdaftar

| slug | nama tampilan | tier | eventCategory | status | komponen frontend |
|---|---|---|---|---|---|
| `royal-floral` | Royal Floral | FREE | WEDDING | aktif | `TemplateRoyalFloral` |
| `modern-minimalist` | Modern Minimalist | FREE | WEDDING | aktif | `TemplateModernMinimalist` |
| `javanese-classic` | Javanese Classic | FREE | WEDDING | aktif | `TemplateJavaneseClassic` |
| `khitanan-ceria-blue` | Khitanan Ceria Blue | FREE | KHITANAN | aktif | `TemplateKhitananCeriaBlue` |
| `rasulan-syukuran-gold` | Rasulan Syukuran Gold | FREE | RASULAN | aktif | `TemplateRasulanSyukuranGold` |

> **Catatan:** Kolom "komponen frontend" adalah referensi untuk tim frontend — nama pastinya
> disesuaikan dengan konvensi naming di repo frontend.

## Aturan Kontrak

### Format Slug

Slug **wajib** mengikuti format kebab-case huruf kecil:

```
^[a-z0-9]+(-[a-z0-9]+)*$
```

Contoh valid: `royal-floral`, `modern-minimalist`, `khitanan-ceria-blue`  
Contoh tidak valid: `Royal Floral`, `modern_minimalist`, `elegan--2`, `Template Baru`

Format ini diberlakukan oleh validasi Zod di
[`src/modules/template/template.schema.ts`](../src/modules/template/template.schema.ts).

### Immutability Slug

Slug bersifat **immutable** setelah template dirilis ke produksi.

Alasannya: halaman undangan publik di frontend memilih komponen template React berdasarkan nilai
`template.slug` yang dikembalikan oleh endpoint:

```
GET /v1/api/public/invitations/:slug
```

Frontend sengaja **tidak** menggunakan `template.id` karena field itu dihasilkan
`@default(cuid())` di `prisma/schema.prisma`, sehingga nilainya berbeda antara database lokal,
staging, dan produksi. Perubahan slug yang tampak sepele (misalnya `royal-floral` → `royalfloral`)
akan diam-diam membuat semua undangan yang memakai template itu jatuh ke desain fallback,
**tanpa error apa pun di sisi backend**.

### Prosedur Penambahan Template Baru

1. Tentukan slug final sesuai format kebab-case.
2. Beri tahu tim frontend slug tersebut agar komponen template disiapkan.
3. Tambahkan baris baru di tabel di atas.
4. Jalankan `POST /templates` (ADMIN only) atau tambahkan ke `prisma/seed.ts`.

Frontend hanya perlu menambahkan satu `case` baru di `TemplateRenderer.tsx` — tidak ada
perubahan kontrak API.

### Prosedur Penonaktifan Template

Gunakan soft-delete melalui endpoint:

```
DELETE /v1/api/templates/:id
```

Endpoint ini memanggil `TemplateRepository.deactivate()`, yang mengubah `isActive = false` — 
**bukan** menghapus baris dari database. Slug **tidak boleh diubah atau dihapus** karena undangan
lama masih mereferensikannya.

Ubah kolom `status` di tabel atas menjadi `nonaktif`.

### Prosedur Perubahan Slug (Breaking Change)

Jika slug **benar-benar** harus berubah, perlakukan sebagai **perubahan breaking**:

1. Koordinasikan dengan tim frontend **sebelum** melakukan perubahan.
2. Rilis perubahan backend dan frontend secara **berpasangan** dalam satu deploy.
3. Perbarui tabel di dokumen ini.

## Referensi

- Implementasi validasi slug: [`src/modules/template/template.schema.ts`](../src/modules/template/template.schema.ts)
- Repository template: [`src/modules/template/template.repository.ts`](../src/modules/template/template.repository.ts)
- Data seed: [`prisma/seed.ts`](../prisma/seed.ts)
