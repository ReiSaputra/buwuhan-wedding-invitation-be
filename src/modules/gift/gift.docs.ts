/**
 * @openapi
 * components:
 *   schemas:
 *     GiftAccount:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cuid123456"
 *         invitationId:
 *           type: string
 *           example: "inv-001"
 *         bankName:
 *           type: string
 *           example: "BCA"
 *         accountNumber:
 *           type: string
 *           example: "1234567890"
 *         accountHolder:
 *           type: string
 *           example: "Fathur Saputra"
 *         type:
 *           type: string
 *           example: "BANK"
 *         order:
 *           type: integer
 *           example: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateGiftAccountRequest:
 *       type: object
 *       required: [bankName, accountNumber, accountHolder]
 *       properties:
 *         bankName:
 *           type: string
 *           example: "BCA"
 *         accountNumber:
 *           type: string
 *           example: "1234567890"
 *         accountHolder:
 *           type: string
 *           example: "Fathur Saputra"
 *         type:
 *           type: string
 *           example: "BANK"
 *         order:
 *           type: integer
 *           example: 0
 *
 *     UpdateGiftAccountRequest:
 *       type: object
 *       properties:
 *         bankName:
 *           type: string
 *           example: "Mandiri"
 *         accountNumber:
 *           type: string
 *           example: "9876543210"
 *         accountHolder:
 *           type: string
 *           example: "Fathur Saputra"
 *         type:
 *           type: string
 *           example: "BANK"
 *         order:
 *           type: integer
 *           example: 1
 *
 *     Gift:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "gift123456"
 *         invitationId:
 *           type: string
 *           example: "inv-001"
 *         giverName:
 *           type: string
 *           example: "Budi Santoso"
 *         amount:
 *           type: number
 *           example: 500000
 *         method:
 *           type: string
 *           enum: [CASH, TRANSFER, EWALLET]
 *           example: "TRANSFER"
 *         note:
 *           type: string
 *           nullable: true
 *           example: "Selamat menempuh hidup baru!"
 *         receivedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateGiftRequest:
 *       type: object
 *       required: [giverName, amount]
 *       properties:
 *         giverName:
 *           type: string
 *           example: "Budi Santoso"
 *         amount:
 *           type: number
 *           example: 500000
 *         method:
 *           type: string
 *           enum: [CASH, TRANSFER, EWALLET]
 *           example: "TRANSFER"
 *         note:
 *           type: string
 *           nullable: true
 *           example: "Selamat berbahagia"
 *         receivedAt:
 *           type: string
 *           format: date-time
 *
 *     UpdateGiftRequest:
 *       type: object
 *       properties:
 *         giverName:
 *           type: string
 *           example: "Budi Santoso"
 *         amount:
 *           type: number
 *           example: 750000
 *         method:
 *           type: string
 *           enum: [CASH, TRANSFER, EWALLET]
 *           example: "TRANSFER"
 *         note:
 *           type: string
 *           nullable: true
 *           example: "Selamat berbahagia ya"
 *         receivedAt:
 *           type: string
 *           format: date-time
 *
 *     GiftSummary:
 *       type: object
 *       properties:
 *         totalGifts:
 *           type: integer
 *           example: 10
 *         totalAmount:
 *           type: number
 *           example: 5000000
 *         byMethod:
 *           type: object
 *           properties:
 *             CASH:
 *               type: object
 *               properties:
 *                 count: { type: integer, example: 2 }
 *                 totalAmount: { type: number, example: 1000000 }
 *             TRANSFER:
 *               type: object
 *               properties:
 *                 count: { type: integer, example: 7 }
 *                 totalAmount: { type: number, example: 3500000 }
 *             EWALLET:
 *               type: object
 *               properties:
 *                 count: { type: integer, example: 1 }
 *                 totalAmount: { type: number, example: 500000 }
 */

/**
 * @openapi
 * /invitations/{invitationId}/gift-accounts:
 *   get:
 *     summary: Ambil daftar rekening kado pengantin
 *     tags: [Hadiah & Amplop Digital]
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
 *         description: Berhasil mengambil daftar rekening
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Tidak memiliki akses ke undangan ini
 *       404:
 *         description: Undangan tidak ditemukan
 *
 *   post:
 *     summary: Tambah rekening kado baru
 *     tags: [Hadiah & Amplop Digital]
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
 *             $ref: '#/components/schemas/CreateGiftAccountRequest'
 *     responses:
 *       201:
 *         description: Rekening hadiah berhasil ditambahkan
 *       400:
 *         description: Validasi request gagal
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Tidak memiliki akses ke undangan ini
 *       404:
 *         description: Undangan tidak ditemukan
 *
 * /gift-accounts/{id}:
 *   patch:
 *     summary: Perbarui data rekening kado
 *     tags: [Hadiah & Amplop Digital]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *             $ref: '#/components/schemas/UpdateGiftAccountRequest'
 *     responses:
 *       200:
 *         description: Rekening berhasil diperbarui
 *       400:
 *         description: Validasi request gagal
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Tidak memiliki akses
 *       404:
 *         description: Rekening tidak ditemukan
 *
 *   delete:
 *     summary: Hapus rekening kado
 *     tags: [Hadiah & Amplop Digital]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rekening berhasil dihapus
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Tidak memiliki akses
 *       404:
 *         description: Rekening tidak ditemukan
 *
 * /invitations/{invitationId}/gifts:
 *   get:
 *     summary: Ambil daftar catatan hadiah/amplop masuk
 *     tags: [Hadiah & Amplop Digital]
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
 *         description: Daftar hadiah berhasil diambil
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Tidak memiliki akses
 *       404:
 *         description: Undangan tidak ditemukan
 *
 *   post:
 *     summary: Catat hadiah/amplop baru yang masuk
 *     tags: [Hadiah & Amplop Digital]
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
 *             $ref: '#/components/schemas/CreateGiftRequest'
 *     responses:
 *       201:
 *         description: Catatan hadiah berhasil ditambahkan
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Tidak memiliki akses
 *       404:
 *         description: Undangan tidak ditemukan
 *
 * /invitations/{invitationId}/gifts/summary:
 *   get:
 *     summary: Ringkasan total dan breakdown metode hadiah/amplop digital
 *     tags: [Hadiah & Amplop Digital]
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
 *         description: Ringkasan hadiah berhasil diambil
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Tidak memiliki akses
 *       404:
 *         description: Undangan tidak ditemukan
 *
 * /gifts/{id}:
 *   patch:
 *     summary: Perbarui catatan hadiah
 *     tags: [Hadiah & Amplop Digital]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *             $ref: '#/components/schemas/UpdateGiftRequest'
 *     responses:
 *       200:
 *         description: Catatan hadiah berhasil diperbarui
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Tidak memiliki akses
 *       404:
 *         description: Hadiah tidak ditemukan
 *
 *   delete:
 *     summary: Hapus catatan hadiah
 *     tags: [Hadiah & Amplop Digital]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catatan hadiah berhasil dihapus
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Tidak memiliki akses
 *       404:
 *         description: Hadiah tidak ditemukan
 */

