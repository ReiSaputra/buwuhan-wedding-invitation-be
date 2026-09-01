/**
 * @openapi
 * components:
 *   schemas:
 *     BuwuhanItemInput:
 *       type: object
 *       required: [itemName, quantity, unit]
 *       properties:
 *         itemName:
 *           type: string
 *           description: Nama barang, bantuan, atau uang yang diberikan.
 *           example: "Beras"
 *         quantity:
 *           type: number
 *           description: Jumlah/kuantitas bantuan (> 0).
 *           example: 25
 *         unit:
 *           type: string
 *           enum: [transaksi, kg, gram, liter, karung, ekor, unit, pack, box, orang, jasa]
 *           description: Satuan kuantitas bantuan.
 *           example: "kg"
 *         category:
 *           type: string
 *           nullable: true
 *           description: Kategori opsional untuk pengelompokan (misal Sembako, Elektronik, Uang).
 *           example: "Sembako"
 *         estimatedValue:
 *           type: number
 *           nullable: true
 *           description: Estimasi nilai nominal dalam Rupiah (opsional).
 *           example: 350000
 *
 *     CreateBuwuhanRequestBody:
 *       type: object
 *       required: [giverName, items]
 *       properties:
 *         giverName:
 *           type: string
 *           description: Nama pemberi hadiah / buwuhan.
 *           example: "Ahmad Subarjo"
 *         note:
 *           type: string
 *           nullable: true
 *           description: Catatan atau ucapan doa restu dari pemberi.
 *           example: "Semoga berkah dan langgeng selalu"
 *         receivedAt:
 *           type: string
 *           format: date-time
 *           description: Waktu penerimaan bantuan (ISO 8601). Default waktu sekarang jika dikosongkan.
 *           example: "2026-08-21T20:15:00.000Z"
 *         items:
 *           type: array
 *           description: Daftar item bantuan yang diberikan (minimal 1 item).
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/BuwuhanItemInput'
 *           example:
 *             - itemName: "Uang Tunai"
 *               quantity: 1
 *               unit: "transaksi"
 *               estimatedValue: 100000
 *             - itemName: "Beras"
 *               quantity: 25
 *               unit: "kg"
 *               category: "Sembako"
 *               estimatedValue: 350000
 *             - itemName: "Rice Cooker"
 *               quantity: 1
 *               unit: "unit"
 *
 *     UpdateBuwuhanRequestBody:
 *       type: object
 *       description: Minimal satu field harus diisi. Jika items dikirim, akan mengganti seluruh items lama (replace-all).
 *       properties:
 *         giverName:
 *           type: string
 *           example: "Ahmad Subarjo"
 *         note:
 *           type: string
 *           nullable: true
 *           example: "Catatan diperbarui"
 *         receivedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-21T20:30:00.000Z"
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/BuwuhanItemInput'
 *
 *     BuwuhanItemResponseData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cly3k9h2p0000v8og3f1a9x01"
 *         buwuhanId:
 *           type: string
 *           example: "cly3k9h2p0000v8og3f1a9x00"
 *         itemName:
 *           type: string
 *           example: "Beras"
 *         quantity:
 *           type: number
 *           example: 25
 *         unit:
 *           type: string
 *           example: "kg"
 *         category:
 *           type: string
 *           nullable: true
 *           example: "Sembako"
 *         estimatedValue:
 *           type: number
 *           nullable: true
 *           example: 350000
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-21T20:15:00.000Z"
 *
 *     BuwuhanResponseData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cly3k9h2p0000v8og3f1a9x00"
 *         invitationId:
 *           type: string
 *           example: "cly3k8a1b0000v8og3f1a1111"
 *         giverName:
 *           type: string
 *           example: "Ahmad Subarjo"
 *         note:
 *           type: string
 *           nullable: true
 *           example: "Semoga berkah dan langgeng selalu"
 *         receivedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-21T20:15:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-21T20:15:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-21T20:15:00.000Z"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BuwuhanItemResponseData'
 *
 *     OwnerBuwuhanResponseData:
 *       allOf:
 *         - $ref: '#/components/schemas/BuwuhanResponseData'
 *         - type: object
 *           properties:
 *             invitationTitle:
 *               type: string
 *               example: "Han & Saputra"
 *             invitationSlug:
 *               type: string
 *               example: "han-saputra"
 *
 *     TopItemSummary:
 *       type: object
 *       nullable: true
 *       properties:
 *         itemName:
 *           type: string
 *           example: "Beras"
 *         totalQuantity:
 *           type: number
 *           example: 350
 *         unit:
 *           type: string
 *           example: "kg"
 *
 *     BuwuhanSummaryResponseData:
 *       type: object
 *       properties:
 *         totalItems:
 *           type: integer
 *           description: Total seluruh item bantuan yang tercatat.
 *           example: 148
 *         totalTransactions:
 *           type: integer
 *           description: Total transaksi / amplop / pemberi buwuhan.
 *           example: 73
 *         totalEstimatedValue:
 *           type: number
 *           description: Total estimasi nominal bantuan dalam Rupiah.
 *           example: 25000000
 *         totalItemsThisMonth:
 *           type: integer
 *           description: Jumlah item bantuan yang diterima pada bulan berjalan.
 *           example: 24
 *         topItem:
 *           $ref: '#/components/schemas/TopItemSummary'
 */

/**
 * @openapi
 * /invitations/{invitationId}/buwuhans:
 *   post:
 *     tags: [Buwuhan]
 *     summary: Tambah catatan buwuh baru
 *     description: Mencatat hadiah / bantuan amplop dari tamu ke suatu undangan dengan pola Header-Detail (1 transaksi -> banyak item).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan pernikahan
 *         example: "cly3k8a1b0000v8og3f1a1111"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBuwuhanRequestBody'
 *     responses:
 *       201:
 *         description: Catatan buwuh berhasil ditambahkan.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BuwuhanResponseData'
 *             example:
 *               message: "Catatan buwuh berhasil ditambahkan"
 *               status: 201
 *               data:
 *                 id: "cly3k9h2p0000v8og3f1a9x00"
 *                 invitationId: "cly3k8a1b0000v8og3f1a1111"
 *                 giverName: "Ahmad Subarjo"
 *                 note: "Semoga berkah dan langgeng selalu"
 *                 receivedAt: "2026-08-21T20:15:00.000Z"
 *                 createdAt: "2026-08-21T20:15:00.000Z"
 *                 updatedAt: "2026-08-21T20:15:00.000Z"
 *                 items:
 *                   - id: "cly3k9h2p0000v8og3f1a9x01"
 *                     buwuhanId: "cly3k9h2p0000v8og3f1a9x00"
 *                     itemName: "Uang Tunai"
 *                     quantity: 1
 *                     unit: "transaksi"
 *                     category: null
 *                     estimatedValue: 100000
 *                     createdAt: "2026-08-21T20:15:00.000Z"
 *                   - id: "cly3k9h2p0000v8og3f1a9x02"
 *                     buwuhanId: "cly3k9h2p0000v8og3f1a9x00"
 *                     itemName: "Beras"
 *                     quantity: 25
 *                     unit: "kg"
 *                     category: "Sembako"
 *                     estimatedValue: 350000
 *                     createdAt: "2026-08-21T20:15:00.000Z"
 *       400:
 *         description: Validasi gagal (misal items kosong atau satuan tidak didukung).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Satuan tidak valid"
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Token akses tidak ditemukan"
 *       404:
 *         description: Undangan tidak ditemukan atau bukan milik pengguna.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Undangan tidak ditemukan"
 *
 *   get:
 *     tags: [Buwuhan]
 *     summary: Ambil daftar seluruh catatan buwuh undangan
 *     description: Mengembalikan daftar seluruh transaksi buwuh beserta item detailnya untuk undangan tertentu.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan pernikahan
 *         example: "cly3k8a1b0000v8og3f1a1111"
 *     responses:
 *       200:
 *         description: Daftar buwuh berhasil diambil.
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
 *                         $ref: '#/components/schemas/BuwuhanResponseData'
 *             example:
 *               message: "Daftar buwuh berhasil diambil"
 *               status: 200
 *               data:
 *                 - id: "cly3k9h2p0000v8og3f1a9x00"
 *                   invitationId: "cly3k8a1b0000v8og3f1a1111"
 *                   giverName: "Ahmad Subarjo"
 *                   note: "Semoga berkah dan langgeng selalu"
 *                   receivedAt: "2026-08-21T20:15:00.000Z"
 *                   createdAt: "2026-08-21T20:15:00.000Z"
 *                   updatedAt: "2026-08-21T20:15:00.000Z"
 *                   items:
 *                     - id: "cly3k9h2p0000v8og3f1a9x01"
 *                       buwuhanId: "cly3k9h2p0000v8og3f1a9x00"
 *                       itemName: "Beras"
 *                       quantity: 25
 *                       unit: "kg"
 *                       category: "Sembako"
 *                       estimatedValue: 350000
 *                       createdAt: "2026-08-21T20:15:00.000Z"
 *       401:
 *         description: Unauthorized.
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
 */

/**
 * @openapi
 * /invitations/{invitationId}/buwuhans/summary:
 *   get:
 *     tags: [Buwuhan]
 *     summary: Ringkasan statistik catatan buwuh
 *     description: Mengembalikan metrik statistik ringkas untuk kartu dashboard buwuh (total item, total transaksi, total estimasi rupiah, item bulan ini, top item).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan pernikahan
 *     responses:
 *       200:
 *         description: Ringkasan statistik berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BuwuhanSummaryResponseData'
 *             example:
 *               message: "Ringkasan buwuh berhasil diambil"
 *               status: 200
 *               data:
 *                 totalItems: 148
 *                 totalTransactions: 73
 *                 totalEstimatedValue: 25000000
 *                 totalItemsThisMonth: 24
 *                 topItem:
 *                   itemName: "Beras"
 *                   totalQuantity: 350
 *                   unit: "kg"
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
 */

/**
 * @openapi
 * /buwuhans:
 *   get:
 *     tags: [Buwuhan]
 *     summary: Ambil daftar catatan buwuh lintas seluruh undangan
 *     description: Mengembalikan seluruh catatan buwuh dari semua undangan yang dimiliki oleh pengguna yang sedang login, dilengkapi informasi judul dan slug undangan asalnya.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar buwuh berhasil diambil.
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
 *                         $ref: '#/components/schemas/OwnerBuwuhanResponseData'
 *             example:
 *               message: "Daftar buwuh berhasil diambil"
 *               status: 200
 *               data:
 *                 - id: "cly3k9h2p0000v8og3f1a9x00"
 *                   invitationId: "cly3k8a1b0000v8og3f1a1111"
 *                   invitationTitle: "Han & Saputra"
 *                   invitationSlug: "han-saputra"
 *                   giverName: "H. Ahmad & Keluarga"
 *                   note: "Selamat menempuh hidup baru"
 *                   receivedAt: "2026-08-21T13:15:00.000Z"
 *                   createdAt: "2026-08-21T13:15:00.000Z"
 *                   updatedAt: "2026-08-21T13:15:00.000Z"
 *                   items:
 *                     - id: "cly3k9h2p0000v8og3f1a9x01"
 *                       buwuhanId: "cly3k9h2p0000v8og3f1a9x00"
 *                       itemName: "Beras"
 *                       quantity: 50
 *                       unit: "kg"
 *                       category: "Sembako"
 *                       estimatedValue: 650000
 *                       createdAt: "2026-08-21T13:15:00.000Z"
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Token akses tidak ditemukan"
 */

/**
 * @openapi
 * /buwuhans/{id}:
 *   get:
 *     tags: [Buwuhan]
 *     summary: Ambil detail satu transaksi buwuh
 *     description: Mengembalikan data lengkap 1 transaksi buwuh beserta seluruh rincian item bantuannya.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID catatan buwuh
 *     responses:
 *       200:
 *         description: Data buwuh berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BuwuhanResponseData'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       403:
 *         description: Forbidden - Catatan buwuh bukan milik akun yang sedang login.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Catatan buwuh tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 *   patch:
 *     tags: [Buwuhan]
 *     summary: Perbarui catatan buwuh
 *     description: Memperbarui header buwuhan dan/atau mengganti rincian item secara keseluruhan (replace-all items).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID catatan buwuh
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBuwuhanRequestBody'
 *     responses:
 *       200:
 *         description: Catatan buwuh berhasil diperbarui.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BuwuhanResponseData'
 *       400:
 *         description: Validasi gagal.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       403:
 *         description: Forbidden - Bukan milik Anda.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Catatan buwuh tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 *   delete:
 *     tags: [Buwuhan]
 *     summary: Hapus catatan buwuh
 *     description: Menghapus catatan buwuhan beserta semua rincian item di dalamnya secara cascade.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID catatan buwuh
 *     responses:
 *       200:
 *         description: Catatan buwuh berhasil dihapus.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Catatan buwuh berhasil dihapus"
 *                 status:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       403:
 *         description: Forbidden - Bukan milik Anda.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Catatan buwuh tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 */
