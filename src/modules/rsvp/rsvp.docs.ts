// Taruh file ini di: src/modules/rsvp/rsvp.docs.ts
//
// File ini murni JSDoc comment block (@openapi) yang di-scan otomatis oleh
// swagger-jsdoc lewat glob di src/config/swagger.config.ts.

/**
 * @openapi
 * components:
 *   schemas:
 *     SubmitRSVPRequestBody:
 *       type: object
 *       required: [status]
 *       description: Mengisi qrCode (jika tamu terdaftar) ATAU name (jika tamu publik baru).
 *       properties:
 *         status:
 *           type: string
 *           enum: [CONFIRMED, DECLINED]
 *           description: Konfirmasi kehadiran (CONFIRMED = Hadir, DECLINED = Tidak Hadir).
 *           example: "CONFIRMED"
 *         qrCode:
 *           type: string
 *           description: Kode QR / token acak tamu terdaftar (opsional jika mengisi nama manual).
 *           example: "7B3A9C12E4F0"
 *         name:
 *           type: string
 *           description: Nama tamu (wajib jika tidak menyertakan qrCode).
 *           example: "Rizky Ramadhan"
 *         phone:
 *           type: string
 *           example: "081234567890"
 *         email:
 *           type: string
 *           format: email
 *           example: "rizky@example.com"
 *         reservation:
 *           type: integer
 *           description: Jumlah orang yang akan hadir (jika DECLINED otomatis 0).
 *           default: 1
 *           example: 2
 *         message:
 *           type: string
 *           description: Pesan ucapan & doa restu untuk mempelai.
 *           example: "Selamat menempuh hidup baru! Semoga samawa selamanya yaa."
 *
 *     RSVPItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cly3k9h2p0000v8og3f1a7x99"
 *         status:
 *           type: string
 *           enum: [CONFIRMED, DECLINED]
 *           example: "CONFIRMED"
 *         reservation:
 *           type: integer
 *           example: 2
 *         message:
 *           type: string
 *           nullable: true
 *           example: "Selamat menempuh hidup baru! Semoga samawa selamanya yaa."
 *         guestId:
 *           type: string
 *           example: "cly3k9h2p0000v8og3f1a7x2q"
 *         guestName:
 *           type: string
 *           example: "Rizky Ramadhan"
 *         guestCategory:
 *           type: string
 *           nullable: true
 *           example: "Teman"
 *         guestPhone:
 *           type: string
 *           nullable: true
 *           example: "081234567890"
 *         guestEmail:
 *           type: string
 *           nullable: true
 *           example: "rizky@example.com"
 *         invitationId:
 *           type: string
 *           example: "cly3k8a1b0000v8og3f1a1111"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-27T00:15:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-27T00:15:00.000Z"
 *
 *     WishItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cly3k9h2p0000v8og3f1a7x99"
 *         guestName:
 *           type: string
 *           example: "Rizky Ramadhan"
 *         status:
 *           type: string
 *           enum: [CONFIRMED, DECLINED]
 *           example: "CONFIRMED"
 *         message:
 *           type: string
 *           example: "Selamat menempuh hidup baru! Semoga samawa selamanya yaa."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-27T00:15:00.000Z"
 *
 *     RSVPStatsResponseData:
 *       type: object
 *       properties:
 *         totalGuests:
 *           type: integer
 *           description: Total tamu yang terdaftar di undangan.
 *           example: 100
 *         totalResponded:
 *           type: integer
 *           description: Total tamu yang sudah memberikan respon RSVP.
 *           example: 80
 *         totalPending:
 *           type: integer
 *           description: Total tamu yang belum mengisi respon RSVP.
 *           example: 20
 *         totalConfirmed:
 *           type: integer
 *           description: Total respon konfirmasi Hadir.
 *           example: 70
 *         totalDeclined:
 *           type: integer
 *           description: Total respon konfirmasi Tidak Hadir.
 *           example: 10
 *         totalPaxConfirmed:
 *           type: integer
 *           description: Total akumulasi jumlah orang yang akan hadir.
 *           example: 135
 */

/**
 * @openapi
 * /public/invitations/{slug}/rsvp:
 *   post:
 *     tags: [RSVP]
 *     summary: Kirim atau perbarui konfirmasi kehadiran & ucapan (RSVP)
 *     description: Endpoint publik untuk mengirimkan konfirmasi kehadiran (Hadir/Tidak Hadir) dan ucapan doa restu dari web undangan. Jika tamu terdaftar mengisi ulang, data respon sebelumnya akan di-update (upsert).
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug undangan pernikahan.
 *         example: "ayu-dan-budi"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitRSVPRequestBody'
 *     responses:
 *       200:
 *         description: RSVP berhasil dikirim / diperbarui.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/RSVPItemResponse'
 *             example:
 *               message: "RSVP submitted successfully"
 *               status: 200
 *               data:
 *                 id: "cly3k9h2p0000v8og3f1a7x99"
 *                 status: "CONFIRMED"
 *                 reservation: 2
 *                 message: "Selamat menempuh hidup baru! Semoga samawa selamanya yaa."
 *                 guestId: "cly3k9h2p0000v8og3f1a7x2q"
 *                 guestName: "Rizky Ramadhan"
 *                 guestCategory: "Teman"
 *                 guestPhone: "081234567890"
 *                 guestEmail: "rizky@example.com"
 *                 invitationId: "cly3k8a1b0000v8og3f1a1111"
 *                 createdAt: "2026-08-27T00:15:00.000Z"
 *                 updatedAt: "2026-08-27T00:15:00.000Z"
 *       400:
 *         description: Validasi input gagal (status bukan CONFIRMED/DECLINED, atau tidak menyertakan qrCode/name).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Harus menyertakan qrCode atau name tamu"
 *       404:
 *         description: Undangan tidak ditemukan atau belum dipublikasikan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Undangan tidak ditemukan atau belum dipublikasikan"
 *
 * /public/invitations/{slug}/wishes:
 *   get:
 *     tags: [RSVP]
 *     summary: List ucapan & doa restu publik (Buku Tamu Virtual)
 *     description: Mengambil daftar ucapan doa restu tamu yang telah mengisi RSVP pada undangan publik.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug undangan publik.
 *         example: "ayu-dan-budi"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Jumlah data per halaman.
 *         example: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman.
 *         example: 1
 *     responses:
 *       200:
 *         description: Daftar ucapan berhasil diambil.
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
 *                         $ref: '#/components/schemas/WishItemResponse'
 *             example:
 *               message: "Wishes retrieved successfully"
 *               status: 200
 *               data:
 *                 - id: "cly3k9h2p0000v8og3f1a7x99"
 *                   guestName: "Rizky Ramadhan"
 *                   status: "CONFIRMED"
 *                   message: "Selamat ya Ayu & Budi! Lancar sampai hari-H."
 *                   createdAt: "2026-08-27T00:15:00.000Z"
 *                 - id: "cly3k9h2p0000v8og3f1a7x98"
 *                   guestName: "Dina Permata"
 *                   status: "CONFIRMED"
 *                   message: "Barakallah, semoga menjadi keluarga sakinah mawaddah warahmah."
 *                   createdAt: "2026-08-27T00:10:00.000Z"
 *       404:
 *         description: Undangan tidak ditemukan atau belum dipublikasikan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Undangan tidak ditemukan atau belum dipublikasikan"
 *
 * /invitations/{invitationId}/rsvps:
 *   get:
 *     tags: [RSVP]
 *     summary: List seluruh konfirmasi RSVP pada undangan (Host / Dashboard)
 *     description: Mengambil seluruh daftar konfirmasi RSVP tamu milik undangan user yang sedang login.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CONFIRMED, DECLINED]
 *         description: Filter status kehadiran.
 *         example: "CONFIRMED"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian nama tamu atau isi pesan.
 *         example: "Rizky"
 *     responses:
 *       200:
 *         description: Daftar RSVP berhasil diambil.
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
 *                         $ref: '#/components/schemas/RSVPItemResponse'
 *             example:
 *               message: "RSVP list retrieved successfully"
 *               status: 200
 *               data:
 *                 - id: "cly3k9h2p0000v8og3f1a7x99"
 *                   status: "CONFIRMED"
 *                   reservation: 2
 *                   message: "Selamat yaa!"
 *                   guestId: "cly3k9h2p0000v8og3f1a7x2q"
 *                   guestName: "Rizky Ramadhan"
 *                   guestCategory: "Teman"
 *                   guestPhone: "081234567890"
 *                   guestEmail: "rizky@example.com"
 *                   invitationId: "cly3k8a1b0000v8og3f1a1111"
 *                   createdAt: "2026-08-27T00:15:00.000Z"
 *                   updatedAt: "2026-08-27T00:15:00.000Z"
 *       401:
 *         description: Token akses tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Token akses tidak ditemukan"
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
 * /invitations/{invitationId}/rsvps/stats:
 *   get:
 *     tags: [RSVP]
 *     summary: Statistik rekapitulasi konfirmasi RSVP
 *     description: Menghitung ringkasan jumlah konfirmasi hadir, tidak hadir, belum respon, dan total akumulasi orang (pax) yang hadir.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan.
 *     responses:
 *       200:
 *         description: Statistik RSVP berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/RSVPStatsResponseData'
 *             example:
 *               message: "RSVP statistics retrieved successfully"
 *               status: 200
 *               data:
 *                 totalGuests: 100
 *                 totalResponded: 80
 *                 totalPending: 20
 *                 totalConfirmed: 70
 *                 totalDeclined: 10
 *                 totalPaxConfirmed: 135
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
 *             example:
 *               success: false
 *               message: "Undangan tidak ditemukan"
 *
 * /invitations/{invitationId}/rsvps/{id}:
 *   delete:
 *     tags: [RSVP]
 *     summary: Hapus / moderasi data RSVP
 *     description: Menghapus data konfirmasi kehadiran atau ucapan yang tidak pantas (spam) dari buku tamu undangan.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan.
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID RSVP.
 *     responses:
 *       200:
 *         description: RSVP berhasil dihapus.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *             example:
 *               message: "RSVP deleted successfully"
 *               status: 200
 *       404:
 *         description: Data RSVP atau undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Data RSVP tidak ditemukan"
 */
