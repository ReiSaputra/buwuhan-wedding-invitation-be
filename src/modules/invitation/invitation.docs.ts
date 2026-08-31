// Taruh file ini di: src/modules/invitation/invitation.docs.ts
//
// File ini murni JSDoc comment block (@openapi) yang di-scan otomatis oleh
// swagger-jsdoc lewat glob di src/config/swagger.config.ts.

/**
 * @openapi
 * components:
 *   schemas:
 *     CoupleInput:
 *       type: object
 *       required: [type, name, fatherName, motherName]
 *       properties:
 *         type:
 *           type: string
 *           enum: [BRIDE, GROOM]
 *           description: Jenis mempelai (BRIDE = Mempelai Wanita, GROOM = Mempelai Pria).
 *           example: "BRIDE"
 *         name:
 *           type: string
 *           description: Nama lengkap mempelai.
 *           example: "Ayu Lestari, S.Kom."
 *         fatherName:
 *           type: string
 *           description: Nama ayah kandung.
 *           example: "Bambang Wijaya"
 *         motherName:
 *           type: string
 *           description: Nama ibu kandung.
 *           example: "Siti Aminah"
 *
 *     CreateInvitationRequestBody:
 *       type: object
 *       required: [title, slug]
 *       properties:
 *         title:
 *           type: string
 *           description: Judul utama undangan pernikahan.
 *           example: "Pernikahan Ayu & Budi"
 *         slug:
 *           type: string
 *           description: "Identifier unik URL (hanya huruf kecil, angka, dan tanda hubung '-')."
 *           example: "ayu-dan-budi"
 *         couples:
 *           type: array
 *           description: Harus tepat 2 data mempelai (satu BRIDE dan satu GROOM).
 *           items:
 *             $ref: '#/components/schemas/CoupleInput'
 *         eventDate:
 *           type: string
 *           format: date-time
 *           description: Tanggal acara pernikahan.
 *           example: "2026-10-10T00:00:00.000Z"
 *         eventTime:
 *           type: string
 *           description: Jam / waktu pelaksanaan acara.
 *           example: "07:00 WIB"
 *         venue:
 *           type: string
 *           description: Nama tempat / gedung acara.
 *           example: "Grand Ballroom Hotel Indonesia"
 *         address:
 *           type: string
 *           description: Alamat lengkap tempat acara.
 *           example: "Jl. MH Thamrin No. 1, Jakarta Pusat"
 *         additionalInfo:
 *           type: object
 *           description: Data JSON bebas untuk informasi tambahan seperti live streaming, rekening bank, dsb.
 *           example:
 *             googleMapsUrl: "https://maps.google.com/?q=-6.195,106.823"
 *         templateId:
 *           type: string
 *           description: Opsional. ID template tema undangan. Ditolak (403) jika tier template lebih tinggi dari paket user.
 *           example: "cly3k9h2p0000v8og3f1a7x11"
 *
 *     UpdateInvitationRequestBody:
 *       type: object
 *       description: Minimal satu field harus diisi untuk melakukan update.
 *       properties:
 *         title:
 *           type: string
 *           example: "The Wedding of Ayu & Budi"
 *         slug:
 *           type: string
 *           example: "the-wedding-ayu-budi"
 *         couples:
 *           type: array
 *           description: Jika disertakan, akan menggantikan seluruh pasangan mempelai sebelumnya.
 *           items:
 *             $ref: '#/components/schemas/CoupleInput'
 *         eventDate:
 *           type: string
 *           format: date-time
 *           example: "2026-10-12T00:00:00.000Z"
 *         eventTime:
 *           type: string
 *           example: "08:00 WIB"
 *         venue:
 *           type: string
 *           example: "Gedung Serbaguna Puri"
 *         address:
 *           type: string
 *           example: "Jl. Pajajaran No. 10, Bogor"
 *         additionalInfo:
 *           type: object
 *           example:
 *             googleMapsUrl: "https://maps.google.com/?q=-6.195,106.823"
 *         templateId:
 *           type: string
 *           example: "cly3k9h2p0000v8og3f1a7x22"
 *
 *     UpdateInvitationStatusRequestBody:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [DRAFT, ACTIVE, COMPLETED]
 *           description: Status undangan (DRAFT = belum tayang, ACTIVE = aktif dipublikasikan, COMPLETED = acara selesai).
 *           example: "ACTIVE"
 *
 *     GalleryPhotoItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cly3k9h2p0000v8og3f1a7x2q"
 *         imageUrl:
 *           type: string
 *           example: "https://storage.buwuhan.com/photos/bromo.jpg"
 *         caption:
 *           type: string
 *           nullable: true
 *           example: "Prewedding di Bromo"
 *         order:
 *           type: integer
 *           description: Urutan tampilan foto (menaik / ASC).
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-27T10:00:00.000Z"
 *
 *     LoveStoryItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cly3k9h2p0000v8og3f1a7x2r"
 *         yearOrDate:
 *           type: string
 *           description: Waktu kejadian momen (misal tahun atau tanggal lengkap).
 *           example: "2020"
 *         title:
 *           type: string
 *           description: Judul momen cerita perjalanan cinta.
 *           example: "Pertama Bertemu"
 *         story:
 *           type: string
 *           description: Narasi lengkap cerita cinta.
 *           example: "Kami pertama kali bertemu saat kegiatan kampus..."
 *         imageUrl:
 *           type: string
 *           nullable: true
 *           description: Foto kenangan pada momen tersebut.
 *           example: "https://storage.buwuhan.com/photos/meet.jpg"
 *         order:
 *           type: integer
 *           description: Urutan kronologis cerita (menaik / ASC).
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-27T10:00:00.000Z"
 *
 *     AddGalleryPhotoRequestBody:
 *       type: object
 *       required: [imageUrl]
 *       properties:
 *         imageUrl:
 *           type: string
 *           description: URL publik file foto yang sudah diupload.
 *           example: "https://storage.buwuhan.com/photos/bromo.jpg"
 *         caption:
 *           type: string
 *           description: Keterangan foto kenangan (opsional).
 *           example: "Momen romantis prewedding di Gunung Bromo"
 *         order:
 *           type: integer
 *           default: 0
 *           description: Urutan urut foto.
 *           example: 1
 *
 *     UpdateGalleryPhotoRequestBody:
 *       type: object
 *       description: Minimal satu field harus diisi untuk update foto.
 *       properties:
 *         imageUrl:
 *           type: string
 *           example: "https://storage.buwuhan.com/photos/bromo-v2.jpg"
 *         caption:
 *           type: string
 *           example: "Prewedding Bromo Sunrise"
 *         order:
 *           type: integer
 *           example: 2
 *
 *     AddLoveStoryRequestBody:
 *       type: object
 *       required: [yearOrDate, title, story]
 *       properties:
 *         yearOrDate:
 *           type: string
 *           description: "Waktu kejadian (contoh: '2020', '15 Juni 2021', 'Tahun Ke-2')."
 *           example: "2020"
 *         title:
 *           type: string
 *           description: Judul babak perjalanan kisah cinta.
 *           example: "Pertama Kali Bertemu"
 *         story:
 *           type: string
 *           description: Narasi perjalanan cinta pasangan mempelai.
 *           example: "Kami pertama kali berkenalan di sebuah coffee shop di Yogyakarta..."
 *         imageUrl:
 *           type: string
 *           description: Foto dokumentasi momen (opsional).
 *           example: "https://storage.buwuhan.com/photos/pertama-bertemu.jpg"
 *         order:
 *           type: integer
 *           default: 0
 *           description: Urutan tampilan kronologis cerita.
 *           example: 1
 *
 *     UpdateLoveStoryRequestBody:
 *       type: object
 *       description: Minimal satu field harus diisi untuk update kisah cinta.
 *       properties:
 *         yearOrDate:
 *           type: string
 *           example: "2021"
 *         title:
 *           type: string
 *           example: "Momen Lamaran Romantis"
 *         story:
 *           type: string
 *           example: "Budi resmi melamar Ayu di hadapan keluarga besar..."
 *         imageUrl:
 *           type: string
 *           example: "https://storage.buwuhan.com/photos/lamaran.jpg"
 *         order:
 *           type: integer
 *           example: 2
 *
 *     InvitationData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unik undangan (cuid).
 *           example: "cly3k8a1b0000v8og3f1a1111"
 *         title:
 *           type: string
 *           example: "Pernikahan Ayu & Budi"
 *         slug:
 *           type: string
 *           example: "ayu-dan-budi"
 *         status:
 *           type: string
 *           enum: [DRAFT, ACTIVE, COMPLETED]
 *           example: "ACTIVE"
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-08-27T10:00:00.000Z"
 *         eventDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-10-10T00:00:00.000Z"
 *         eventTime:
 *           type: string
 *           nullable: true
 *           example: "07:00 WIB"
 *         venue:
 *           type: string
 *           nullable: true
 *           example: "Grand Ballroom Hotel Indonesia"
 *         address:
 *           type: string
 *           nullable: true
 *           example: "Jl. MH Thamrin No. 1, Jakarta Pusat"
 *         additionalInfo:
 *           type: object
 *           nullable: true
 *           example:
 *             googleMapsUrl: "https://maps.google.com/?q=-6.195,106.823"
 *         couples:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CoupleInput'
 *           example:
 *             - type: "BRIDE"
 *               name: "Ayu Lestari, S.Kom."
 *               fatherName: "Bambang Wijaya"
 *               motherName: "Siti Aminah"
 *             - type: "GROOM"
 *               name: "Budi Santoso, S.T."
 *               fatherName: "Joko Supriyanto"
 *               motherName: "Sri Rahayu"
 *         template:
 *           type: object
 *           nullable: true
 *           properties:
 *             id: { type: string, example: "cly3k9h2p0000v8og3f1a7x11" }
 *             name: { type: string, example: "Floral Elegant Theme" }
 *             slug: { type: string, example: "floral-elegant" }
 *         galleryPhotos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GalleryPhotoItem'
 *           example:
 *             - id: "cly3k9h2p0000v8og3f1a7x2q"
 *               imageUrl: "https://storage.buwuhan.com/photos/bromo.jpg"
 *               caption: "Prewedding di Bromo"
 *               order: 1
 *               createdAt: "2026-08-27T10:00:00.000Z"
 *         loveStories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LoveStoryItem'
 *           example:
 *             - id: "cly3k9h2p0000v8og3f1a7x2r"
 *               yearOrDate: "2020"
 *               title: "Pertama Bertemu"
 *               story: "Kami pertama kali berkenalan di kampus..."
 *               imageUrl: "https://storage.buwuhan.com/photos/meet.jpg"
 *               order: 1
 *               createdAt: "2026-08-27T10:00:00.000Z"
 */

/**
 * @openapi
 * /invitations:
 *   post:
 *     tags: [Invitation]
 *     summary: Buat undangan baru
 *     description: Membuat draft undangan digital baru. Membutuhkan bearer token login.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInvitationRequestBody'
 *     responses:
 *       201:
 *         description: Undangan berhasil dibuat.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/InvitationData'
 *             example:
 *               message: "Undangan berhasil dibuat"
 *               status: 201
 *               data:
 *                 id: "cly3k8a1b0000v8og3f1a1111"
 *                 title: "Pernikahan Ayu & Budi"
 *                 slug: "ayu-dan-budi"
 *                 status: "DRAFT"
 *                 publishedAt: null
 *                 additionalInfo: { eventDate: "2026-10-10", venue: "Hotel Indonesia" }
 *                 couples:
 *                   - type: "BRIDE"
 *                     name: "Ayu Lestari, S.Kom."
 *                     fatherName: "Bambang Wijaya"
 *                     motherName: "Siti Aminah"
 *                   - type: "GROOM"
 *                     name: "Budi Santoso, S.T."
 *                     fatherName: "Joko Supriyanto"
 *                     motherName: "Sri Rahayu"
 *                 template: null
 *                 galleryPhotos: []
 *                 loveStories: []
 *       400:
 *         description: Validasi input gagal.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Harus ada tepat 2 data mempelai (bride & groom)"
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Token akses tidak ditemukan"
 *       403:
 *         description: Tier template melebihi paket subscription akun.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Template ini butuh paket PRO ke atas"
 *       409:
 *         description: Slug URL sudah dipakai pengguna lain.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Slug sudah digunakan"
 *
 *   get:
 *     tags: [Invitation]
 *     summary: Daftar seluruh undangan milik user (Host Dashboard)
 *     description: Mengambil seluruh undangan yang pernah dibuat oleh user yang sedang login.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar undangan berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/InvitationData'
 *             example:
 *               message: "Daftar undangan berhasil diambil"
 *               status: 200
 *               data:
 *                 - id: "cly3k8a1b0000v8og3f1a1111"
 *                   title: "Pernikahan Ayu & Budi"
 *                   slug: "ayu-dan-budi"
 *                   status: "ACTIVE"
 *                   publishedAt: "2026-08-27T10:00:00.000Z"
 *                   additionalInfo: {}
 *                   couples:
 *                     - type: "BRIDE"
 *                       name: "Ayu Lestari"
 *                       fatherName: "Bambang"
 *                       motherName: "Siti"
 *                     - type: "GROOM"
 *                       name: "Budi Santoso"
 *                       fatherName: "Joko"
 *                       motherName: "Sri"
 *                   template: null
 *                   galleryPhotos: []
 *                   loveStories: []
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 * /invitations/{id}:
 *   get:
 *     tags: [Invitation]
 *     summary: Detail lengkap undangan milik sendiri (Host)
 *     description: Mengambil detail satu undangan lengkap beserta couples, galeri foto, dan cerita cinta.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan.
 *         example: "cly3k8a1b0000v8og3f1a1111"
 *     responses:
 *       200:
 *         description: Undangan ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/InvitationData'
 *             example:
 *               message: "Undangan ditemukan"
 *               status: 200
 *               data:
 *                 id: "cly3k8a1b0000v8og3f1a1111"
 *                 title: "Pernikahan Ayu & Budi"
 *                 slug: "ayu-dan-budi"
 *                 status: "ACTIVE"
 *                 publishedAt: "2026-08-27T10:00:00.000Z"
 *                 additionalInfo: {}
 *                 couples:
 *                   - type: "BRIDE"
 *                     name: "Ayu Lestari"
 *                     fatherName: "Bambang"
 *                     motherName: "Siti"
 *                   - type: "GROOM"
 *                     name: "Budi Santoso"
 *                     fatherName: "Joko"
 *                     motherName: "Sri"
 *                 template: null
 *                 galleryPhotos:
 *                   - id: "photo-1"
 *                     imageUrl: "https://storage.buwuhan.com/photos/bromo.jpg"
 *                     caption: "Prewedding Bromo"
 *                     order: 1
 *                     createdAt: "2026-08-27T10:00:00.000Z"
 *                 loveStories:
 *                   - id: "story-1"
 *                     yearOrDate: "2020"
 *                     title: "Pertama Bertemu"
 *                     story: "Kami pertama kali bertemu di kampus..."
 *                     imageUrl: "https://storage.buwuhan.com/photos/meet.jpg"
 *                     order: 1
 *                     createdAt: "2026-08-27T10:00:00.000Z"
 *       404:
 *         description: Undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Undangan tidak ditemukan"
 *
 *   patch:
 *     tags: [Invitation]
 *     summary: Perbarui data utama undangan
 *     description: Memperbarui judul, slug, pasangan mempelai, atau template undangan.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "cly3k8a1b0000v8og3f1a1111"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInvitationRequestBody'
 *     responses:
 *       200:
 *         description: Undangan berhasil diperbarui.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/InvitationData'
 *       404:
 *         description: Undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 *   delete:
 *     tags: [Invitation]
 *     summary: Hapus undangan
 *     description: Menghapus undangan beserta seluruh data relasi (couples, tamu, rsvp, galeri, dan cerita) secara permanen.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "cly3k8a1b0000v8og3f1a1111"
 *     responses:
 *       200:
 *         description: Undangan berhasil dihapus.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *             example:
 *               message: "Undangan berhasil dihapus"
 *               status: 200
 *       404:
 *         description: Undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 * /invitations/{id}/status:
 *   patch:
 *     tags: [Invitation]
 *     summary: Perbarui status undangan (DRAFT, ACTIVE, COMPLETED)
 *     description: Mengubah status undangan. Jika diubah ke ACTIVE dan belum memiliki publishedAt, publishedAt akan otomatis diisi tanggal saat ini. Undangan dengan status ACTIVE dan COMPLETED dapat diakses publik.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "cly3k8a1b0000v8og3f1a1111"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInvitationStatusRequestBody'
 *     responses:
 *       200:
 *         description: Status undangan berhasil diperbarui.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/InvitationData'
 *             example:
 *               message: "Status undangan berhasil diperbarui"
 *               status: 200
 *               data:
 *                 id: "cly3k8a1b0000v8og3f1a1111"
 *                 title: "Pernikahan Ayu & Budi"
 *                 slug: "ayu-dan-budi"
 *                 status: "ACTIVE"
 *                 publishedAt: "2026-08-27T10:00:00.000Z"
 *                 eventDate: "2026-10-10T00:00:00.000Z"
 *                 eventTime: "07:00 WIB"
 *                 venue: "Grand Ballroom Hotel Indonesia"
 *                 address: "Jl. MH Thamrin No. 1, Jakarta Pusat"
 *                 additionalInfo: {}
 *                 couples: []
 *                 template: null
 *                 galleryPhotos: []
 *                 loveStories: []
 *       404:
 *         description: Undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 * /public/invitations/{slug}:
 *   get:
 *     tags: [Invitation]
 *     summary: Lihat undangan publik (untuk Web Undangan Tamu)
 *     description: "Endpoint publik tanpa token. Hanya undangan dengan status ACTIVE atau COMPLETED yang dapat diakses."
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug unik undangan publik.
 *         example: "ayu-dan-budi"
 *     responses:
 *       200:
 *         description: Undangan publik ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/InvitationData'
 *             example:
 *               message: "Undangan ditemukan"
 *               status: 200
 *               data:
 *                 id: "cly3k8a1b0000v8og3f1a1111"
 *                 title: "Pernikahan Ayu & Budi"
 *                 slug: "ayu-dan-budi"
 *                 status: "ACTIVE"
 *                 publishedAt: "2026-08-27T10:00:00.000Z"
 *                 additionalInfo: { venue: "Puri Begawan", eventDate: "2026-10-10" }
 *                 couples:
 *                   - type: "BRIDE"
 *                     name: "Ayu Lestari"
 *                     fatherName: "Bambang"
 *                     motherName: "Siti"
 *                   - type: "GROOM"
 *                     name: "Budi Santoso"
 *                     fatherName: "Joko"
 *                     motherName: "Sri"
 *                 template:
 *                   id: "t-1"
 *                   name: "Classic Floral"
 *                   slug: "classic-floral"
 *                 galleryPhotos:
 *                   - id: "p-1"
 *                     imageUrl: "https://storage.buwuhan.com/photos/bromo.jpg"
 *                     caption: "Prewedding Bromo"
 *                     order: 1
 *                     createdAt: "2026-08-27T10:00:00.000Z"
 *                 loveStories:
 *                   - id: "s-1"
 *                     yearOrDate: "2020"
 *                     title: "Pertama Bertemu"
 *                     story: "Kami pertama bertemu di..."
 *                     imageUrl: "https://storage.buwuhan.com/photos/meet.jpg"
 *                     order: 1
 *                     createdAt: "2026-08-27T10:00:00.000Z"
 *       404:
 *         description: Undangan tidak ditemukan atau belum dipublikasikan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Undangan tidak ditemukan"
 *
 * /invitations/{invitationId}/gallery:
 *   post:
 *     tags: [Invitation]
 *     summary: Tambah foto ke galeri undangan
 *     description: Menyimpan satu item foto baru ke galeri undangan milik user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan.
 *         example: "cly3k8a1b0000v8og3f1a1111"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddGalleryPhotoRequestBody'
 *     responses:
 *       201:
 *         description: Foto galeri berhasil ditambahkan.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     status: { type: integer, example: 201 }
 *                     data:
 *                       $ref: '#/components/schemas/GalleryPhotoItem'
 *             example:
 *               message: "Foto galeri berhasil ditambahkan"
 *               status: 201
 *               data:
 *                 id: "cly3k9h2p0000v8og3f1a7x2q"
 *                 imageUrl: "https://storage.buwuhan.com/photos/bromo.jpg"
 *                 caption: "Momen romantis prewedding di Gunung Bromo"
 *                 order: 1
 *                 createdAt: "2026-08-27T10:00:00.000Z"
 *       404:
 *         description: Undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Undangan tidak ditemukan"
 *
 * /invitations/{invitationId}/gallery/{id}:
 *   patch:
 *     tags: [Invitation]
 *     summary: Update foto galeri (caption / urutan)
 *     description: Memperbarui caption, URL gambar, atau urutan tampil foto di galeri.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan.
 *         example: "cly3k8a1b0000v8og3f1a1111"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID foto galeri.
 *         example: "cly3k9h2p0000v8og3f1a7x2q"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGalleryPhotoRequestBody'
 *     responses:
 *       200:
 *         description: Foto galeri berhasil diperbarui.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GalleryPhotoItem'
 *             example:
 *               message: "Foto galeri berhasil diperbarui"
 *               status: 200
 *               data:
 *                 id: "cly3k9h2p0000v8og3f1a7x2q"
 *                 imageUrl: "https://storage.buwuhan.com/photos/bromo.jpg"
 *                 caption: "Sunrise di Penanjakan Bromo"
 *                 order: 2
 *                 createdAt: "2026-08-27T10:00:00.000Z"
 *       404:
 *         description: Foto atau undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Foto galeri tidak ditemukan"
 *   delete:
 *     tags: [Invitation]
 *     summary: Hapus foto dari galeri
 *     description: Menghapus satu foto dari galeri undangan.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "cly3k8a1b0000v8og3f1a1111"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "cly3k9h2p0000v8og3f1a7x2q"
 *     responses:
 *       200:
 *         description: Foto galeri berhasil dihapus.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *             example:
 *               message: "Foto galeri berhasil dihapus"
 *               status: 200
 *       404:
 *         description: Foto atau undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Foto galeri tidak ditemukan"
 *
 * /invitations/{invitationId}/stories:
 *   post:
 *     tags: [Invitation]
 *     summary: Tambah momen kisah cinta ke undangan (Love Story Timeline)
 *     description: Menambahkan satu momen perjalanan kisah cinta baru pada undangan.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan.
 *         example: "cly3k8a1b0000v8og3f1a1111"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddLoveStoryRequestBody'
 *     responses:
 *       201:
 *         description: Momen kisah cinta berhasil ditambahkan.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     status: { type: integer, example: 201 }
 *                     data:
 *                       $ref: '#/components/schemas/LoveStoryItem'
 *             example:
 *               message: "Kisah cinta berhasil ditambahkan"
 *               status: 201
 *               data:
 *                 id: "cly3k9h2p0000v8og3f1a7x2r"
 *                 yearOrDate: "2020"
 *                 title: "Pertama Kali Bertemu"
 *                 story: "Kami pertama kali berkenalan di kampus..."
 *                 imageUrl: "https://storage.buwuhan.com/photos/meet.jpg"
 *                 order: 1
 *                 createdAt: "2026-08-27T10:00:00.000Z"
 *       404:
 *         description: Undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Undangan tidak ditemukan"
 *
 * /invitations/{invitationId}/stories/{id}:
 *   patch:
 *     tags: [Invitation]
 *     summary: Update momen kisah cinta
 *     description: Memperbarui judul, tahun/tanggal, narasi, foto, atau urutan kronologis kisah cinta.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "cly3k8a1b0000v8og3f1a1111"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "cly3k9h2p0000v8og3f1a7x2r"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLoveStoryRequestBody'
 *     responses:
 *       200:
 *         description: Momen kisah cinta berhasil diperbarui.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoveStoryItem'
 *             example:
 *               message: "Kisah cinta berhasil diperbarui"
 *               status: 200
 *               data:
 *                 id: "cly3k9h2p0000v8og3f1a7x2r"
 *                 yearOrDate: "2021"
 *                 title: "Momen Lamaran"
 *                 story: "Budi resmi melamar Ayu di hadapan keluarga besar..."
 *                 imageUrl: "https://storage.buwuhan.com/photos/lamaran.jpg"
 *                 order: 2
 *                 createdAt: "2026-08-27T10:00:00.000Z"
 *       404:
 *         description: Kisah cinta atau undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Kisah cinta tidak ditemukan"
 *   delete:
 *     tags: [Invitation]
 *     summary: Hapus momen kisah cinta
 *     description: Menghapus satu momen kisah cinta dari timeline undangan.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "cly3k8a1b0000v8og3f1a1111"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "cly3k9h2p0000v8og3f1a7x2r"
 *     responses:
 *       200:
 *         description: Momen kisah cinta berhasil dihapus.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *             example:
 *               message: "Kisah cinta berhasil dihapus"
 *               status: 200
 *       404:
 *         description: Kisah cinta atau undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Kisah cinta tidak ditemukan"
 */
