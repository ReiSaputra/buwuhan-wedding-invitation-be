// Taruh file ini di: src/modules/guest/guest.docs.ts
//
// File ini murni JSDoc comment block (@openapi) yang di-scan otomatis oleh
// swagger-jsdoc lewat glob di src/config/swagger.config.ts.

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateGuestRequestBody:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           example: "Rizky Ramadhan"
 *         category:
 *           type: string
 *           description: Kategori tamu (misal Keluarga, Saudara, Rekan Kerja, Teman, VIP, Lainnya).
 *           example: "Teman"
 *         phone:
 *           type: string
 *           example: "081234567890"
 *         email:
 *           type: string
 *           format: email
 *           example: "rizky@example.com"
 *         notes:
 *           type: string
 *           description: Catatan tambahan, misal nomor meja atau kelompok.
 *           example: "Meja 4 - Teman SMA"
 *         paxCount:
 *           type: integer
 *           default: 1
 *           description: Estimasi jumlah kuota orang untuk tamu ini.
 *           example: 2
 *
 *     BulkCreateGuestRequestBody:
 *       type: object
 *       required: [guests]
 *       properties:
 *         guests:
 *           type: array
 *           description: Daftar tamu yang ingin di-import sekaligus (maks 500 tamu).
 *           items:
 *             $ref: '#/components/schemas/CreateGuestRequestBody'
 *
 *     UpdateGuestRequestBody:
 *       type: object
 *       description: Semua field opsional, minimal satu harus diisi untuk update.
 *       properties:
 *         name:
 *           type: string
 *           example: "Rizky Ramadhan, S.Kom"
 *         category:
 *           type: string
 *           example: "VIP"
 *         phone:
 *           type: string
 *           example: "081298765432"
 *         email:
 *           type: string
 *           format: email
 *           example: "rizky.new@example.com"
 *         notes:
 *           type: string
 *           example: "Meja VIP 1"
 *         paxCount:
 *           type: integer
 *           example: 3
 *
 *     CheckInGuestRequestBody:
 *       type: object
 *       description: Menyertakan salah satu antara qrCode atau guestId.
 *       properties:
 *         qrCode:
 *           type: string
 *           description: Kode QR unik tamu (12 karakter hex).
 *           example: "7B3A9C12E4F0"
 *         guestId:
 *           type: string
 *           description: ID cuid tamu.
 *           example: "cuid123456"
 *         paxActual:
 *           type: integer
 *           description: Jumlah riil orang yang hadir saat check-in.
 *           example: 2
 *
 *     CheckOutGuestRequestBody:
 *       type: object
 *       description: Menyertakan salah satu antara qrCode atau guestId.
 *       properties:
 *         qrCode:
 *           type: string
 *           description: Kode QR unik tamu.
 *           example: "7B3A9C12E4F0"
 *         guestId:
 *           type: string
 *           description: ID cuid tamu.
 *           example: "cuid123456"
 *
 *     GuestItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: cuid unik tamu.
 *           example: "cly3k9h2p0000v8og3f1a7x2q"
 *         name:
 *           type: string
 *           example: "Rizky Ramadhan"
 *         category:
 *           type: string
 *           nullable: true
 *           example: "Teman"
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "081234567890"
 *         email:
 *           type: string
 *           nullable: true
 *           example: "rizky@example.com"
 *         notes:
 *           type: string
 *           nullable: true
 *           example: "Meja 4 - Teman SMA"
 *         qrCode:
 *           type: string
 *           description: Kode unik untuk QR presensi & URL personal.
 *           example: "7B3A9C12E4F0"
 *         paxCount:
 *           type: integer
 *           example: 2
 *         paxActual:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         isAttended:
 *           type: boolean
 *           example: true
 *         checkedInAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-08-26T14:30:00.000Z"
 *         checkedOutAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         invitationId:
 *           type: string
 *           example: "cuid_invitation_123"
 *         invitationUrl:
 *           type: string
 *           description: URL personal undangan yang membawa token tamu.
 *           example: "https://buwuhan.com/invitation/ayu-dan-budi?to=7B3A9C12E4F0"
 *         whatsappShareUrl:
 *           type: string
 *           nullable: true
 *           description: Tautan direct share WhatsApp berisi template pesan undangan.
 *           example: "https://api.whatsapp.com/send?phone=6281234567890&text=Halo%20Rizky..."
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     BulkGuestResponseData:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           example: 10
 *         guests:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GuestItemResponse'
 *
 *     GuestStatsResponseData:
 *       type: object
 *       properties:
 *         totalGuests:
 *           type: integer
 *           example: 150
 *         totalAttended:
 *           type: integer
 *           example: 110
 *         totalPending:
 *           type: integer
 *           example: 40
 *         totalPaxExpected:
 *           type: integer
 *           example: 250
 *         totalPaxActual:
 *           type: integer
 *           example: 215
 *         byCategory:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             properties:
 *               total: { type: integer, example: 50 }
 *               attended: { type: integer, example: 42 }
 */

/**
 * @openapi
 * /invitations/{invitationId}/guests:
 *   post:
 *     tags: [Guest]
 *     summary: Tambah satu data tamu ke undangan
 *     description: Butuh access token. User harus pemilik undangan (ownerId). Kode QR unik otomatis digenerate.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGuestRequestBody'
 *     responses:
 *       201:
 *         description: Tamu berhasil ditambahkan.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     status: { type: integer, example: 201 }
 *                     data:
 *                       $ref: '#/components/schemas/GuestItemResponse'
 *       400:
 *         description: Validasi input gagal.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       401:
 *         description: Token tidak valid atau tidak disertakan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Undangan tidak ditemukan atau bukan milik requester.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 *   get:
 *     tags: [Guest]
 *     summary: List semua tamu di undangan
 *     description: Mengambil seluruh tamu dalam undangan milik requester dengan opsi filter kategori, status hadir, atau kata kunci pencarian.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kategori tamu (case-insensitive).
 *       - in: query
 *         name: isAttended
 *         schema:
 *           type: boolean
 *         description: Filter status kehadiran (true / false).
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian nama, nomor telepon, email, atau catatan.
 *     responses:
 *       200:
 *         description: Daftar tamu berhasil diambil.
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
 *                         $ref: '#/components/schemas/GuestItemResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 * /invitations/{invitationId}/guests/bulk:
 *   post:
 *     tags: [Guest]
 *     summary: Tambah banyak tamu sekaligus (Bulk Import)
 *     description: Mengimport daftar tamu dalam jumlah banyak sekaligus (maks 500 tamu). Setiap tamu otomatis dibuatkan QR unik.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkCreateGuestRequestBody'
 *     responses:
 *       201:
 *         description: Tamu berhasil ditambahkan secara bulk.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     status: { type: integer, example: 201 }
 *                     data:
 *                       $ref: '#/components/schemas/BulkGuestResponseData'
 *       400:
 *         description: Validasi array tamu gagal.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 * /invitations/{invitationId}/guests/stats:
 *   get:
 *     tags: [Guest]
 *     summary: Rekapitulasi kehadiran tamu & statistik per kategori
 *     description: Menampilkan ringkasan total tamu, total hadir, total belum hadir, total orang riil, dan rincian per kategori.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistik kehadiran berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GuestStatsResponseData'
 *       404:
 *         description: Undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 * /invitations/{invitationId}/guests/{id}:
 *   get:
 *     tags: [Guest]
 *     summary: Detail satu tamu
 *     description: Mengambil data detail tamu tertentu termasuk URL personal dan link WhatsApp share.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data tamu ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GuestItemResponse'
 *       404:
 *         description: Tamu atau undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 *   patch:
 *     tags: [Guest]
 *     summary: Update data tamu
 *     description: Memperbarui data tamu (nama, kontak, kategori, catatan, dll).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGuestRequestBody'
 *     responses:
 *       200:
 *         description: Data tamu berhasil diupdate.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GuestItemResponse'
 *       404:
 *         description: Data tamu tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 *   delete:
 *     tags: [Guest]
 *     summary: Hapus tamu
 *     description: Menghapus data tamu dari undangan.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tamu berhasil dihapus.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *       404:
 *         description: Tamu tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 * /invitations/{invitationId}/guests/check-in:
 *   post:
 *     tags: [Guest]
 *     summary: Presensi Check-in kehadiran tamu (scan QR atau ID)
 *     description: Mencatat waktu kehadiran (`checkedInAt`), mengubah `isAttended = true`, dan mencatat kuota riil hadir (`paxActual`).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckInGuestRequestBody'
 *     responses:
 *       200:
 *         description: Check-in berhasil dicatat.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GuestItemResponse'
 *       404:
 *         description: Kode QR atau Tamu tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 * /invitations/{invitationId}/guests/check-out:
 *   post:
 *     tags: [Guest]
 *     summary: Presensi Check-out kepulangan tamu (scan QR atau ID)
 *     description: Mencatat waktu kepulangan tamu (`checkedOutAt`).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckOutGuestRequestBody'
 *     responses:
 *       200:
 *         description: Check-out berhasil dicatat.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GuestItemResponse'
 *             example:
 *               message: "Guest checked out successfully"
 *               status: 200
 *               data:
 *                 id: "cly3k9h2p0000v8og3f1a7x2q"
 *                 name: "Rizky Ramadhan"
 *                 category: "Teman"
 *                 phone: "081234567890"
 *                 email: "rizky@example.com"
 *                 notes: "Meja 4"
 *                 qrCode: "7B3A9C12E4F0"
 *                 paxCount: 2
 *                 paxActual: 2
 *                 isAttended: true
 *                 checkedInAt: "2026-08-26T14:30:00.000Z"
 *                 checkedOutAt: "2026-08-26T17:00:00.000Z"
 *                 invitationId: "cly3k8a1b0000v8og3f1a1111"
 *                 invitationUrl: "https://buwuhan.com/invitation/ayu-dan-budi?to=7B3A9C12E4F0"
 *                 whatsappShareUrl: "https://api.whatsapp.com/send?phone=6281234567890&text=Halo%20Rizky..."
 *                 createdAt: "2026-08-26T10:00:00.000Z"
 *                 updatedAt: "2026-08-26T17:00:00.000Z"
 *       400:
 *         description: Request tidak menyertakan qrCode atau guestId.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Harus menyertakan qrCode atau guestId untuk check-out"
 *       404:
 *         description: Kode QR atau Tamu tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Data tamu dengan kode tersebut tidak ditemukan"
 *
 * /public/invitations/{slug}/guests/verify/{qrCode}:
 *   get:
 *     tags: [Guest]
 *     summary: Verifikasi QR Code tamu publik (resepsionis / barcode scanner)
 *     description: Endpoint publik untuk memeriksa validitas QR code tamu dan menampilkan data ringkas tamu saat scan di lokasi acara.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug undangan publik.
 *         example: "ayu-dan-budi"
 *       - in: path
 *         name: qrCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Kode QR tamu.
 *         example: "7B3A9C12E4F0"
 *     responses:
 *       200:
 *         description: Data QR code valid.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GuestItemResponse'
 *             example:
 *               message: "Guest retrieved successfully"
 *               status: 200
 *               data:
 *                 id: "cly3k9h2p0000v8og3f1a7x2q"
 *                 name: "Rizky Ramadhan"
 *                 category: "Teman"
 *                 phone: "081234567890"
 *                 email: "rizky@example.com"
 *                 notes: "Meja 4"
 *                 qrCode: "7B3A9C12E4F0"
 *                 paxCount: 2
 *                 paxActual: null
 *                 isAttended: false
 *                 checkedInAt: null
 *                 checkedOutAt: null
 *                 invitationId: "cly3k8a1b0000v8og3f1a1111"
 *                 invitationUrl: "https://buwuhan.com/invitation/ayu-dan-budi?to=7B3A9C12E4F0"
 *                 whatsappShareUrl: "https://api.whatsapp.com/send?phone=6281234567890&text=Halo%20Rizky..."
 *                 createdAt: "2026-08-26T10:00:00.000Z"
 *                 updatedAt: "2026-08-26T10:00:00.000Z"
 *       404:
 *         description: Undangan atau kode QR tidak valid/tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Undangan atau data tamu tidak ditemukan"
 */
