/**
 * @openapi
 * components:
 *   schemas:
 *     UserProfileData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cly3k8a1b0000v8og3f1a1111"
 *         fullName:
 *           type: string
 *           example: "Fathur Saputra"
 *         email:
 *           type: string
 *           format: email
 *           example: "fathur@example.com"
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           example: "USER"
 *         planTier:
 *           type: string
 *           enum: [FREE, PRO, MAX]
 *           example: "FREE"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-27T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-27T10:00:00.000Z"
 *
 *     AdminUserListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cly3k8a1b0000v8og3f1a1111"
 *         fullName:
 *           type: string
 *           example: "Fathur Saputra"
 *         email:
 *           type: string
 *           format: email
 *           example: "fathur@example.com"
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           example: "USER"
 *         planTier:
 *           type: string
 *           enum: [FREE, PRO, MAX]
 *           example: "PRO"
 *         totalInvitations:
 *           type: integer
 *           example: 3
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-27T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-28T12:00:00.000Z"
 *
 *     AdminUserInvitationSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cly3k8a1b0000v8og3f1a2222"
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
 *         eventCategory:
 *           type: string
 *           enum: [WEDDING, KHITANAN, RASULAN, AQIQAH]
 *           example: "WEDDING"
 *         eventDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-10-15T00:00:00.000Z"
 *         eventTime:
 *           type: string
 *           nullable: true
 *           example: "08:00 WIB"
 *         venue:
 *           type: string
 *           nullable: true
 *           example: "Grand Ballroom Hotel Indonesia"
 *         totalGuests:
 *           type: integer
 *           example: 150
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-27T10:00:00.000Z"
 *
 *     AdminUserDetailData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cly3k8a1b0000v8og3f1a1111"
 *         fullName:
 *           type: string
 *           example: "Fathur Saputra"
 *         email:
 *           type: string
 *           format: email
 *           example: "fathur@example.com"
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           example: "USER"
 *         planTier:
 *           type: string
 *           enum: [FREE, PRO, MAX]
 *           example: "PRO"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-27T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-28T12:00:00.000Z"
 *         stats:
 *           type: object
 *           properties:
 *             totalInvitations:
 *               type: integer
 *               example: 2
 *             totalGuests:
 *               type: integer
 *               example: 320
 *         invitations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminUserInvitationSummary'
 *
 *     UpdateUserTierRequestBody:
 *       type: object
 *       required: [planTier]
 *       properties:
 *         planTier:
 *           type: string
 *           enum: [FREE, PRO, MAX]
 *           example: "PRO"
 *
 *     UpdateUserRoleRequestBody:
 *       type: object
 *       required: [role]
 *       properties:
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           example: "ADMIN"
 *
 *     RevokeUserSessionsData:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           example: "cly3k8a1b0000v8og3f1a1111"
 *         revokedCount:
 *           type: integer
 *           example: 3
 */

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [User]
 *     summary: Ambil profil pengguna yang sedang login
 *     description: Mengembalikan data profil user terautentikasi termasuk status role dan paket tier langganan.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil pengguna berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfileData'
 *             example:
 *               message: "Profil pengguna berhasil diambil"
 *               status: 200
 *               data:
 *                 id: "cly3k8a1b0000v8og3f1a1111"
 *                 fullName: "Fathur Saputra"
 *                 email: "fathur@example.com"
 *                 role: "USER"
 *                 planTier: "FREE"
 *                 createdAt: "2026-08-27T10:00:00.000Z"
 *       401:
 *         description: Unauthorized - Token tidak valid atau tidak disertakan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Pengguna tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 */

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin - User]
 *     summary: Daftar pengguna platform (admin)
 *     description: Menampilkan daftar seluruh pengguna dengan dukungan paginasi, pencarian nama/email, dan filter role/tier. Hanya dapat diakses oleh ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman (maks 100).
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian nama lengkap atau email pengguna.
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN]
 *         description: Filter berdasarkan peran pengguna.
 *       - in: query
 *         name: planTier
 *         schema:
 *           type: string
 *           enum: [FREE, PRO, MAX]
 *         description: Filter berdasarkan paket tier pengguna.
 *     responses:
 *       200:
 *         description: Daftar pengguna berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/AdminUserListItem'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *             example:
 *               message: "Daftar pengguna berhasil diambil"
 *               status: 200
 *               data:
 *                 users:
 *                   - id: "cly3k8a1b0000v8og3f1a1111"
 *                     fullName: "Fathur Saputra"
 *                     email: "fathur@example.com"
 *                     role: "USER"
 *                     planTier: "PRO"
 *                     totalInvitations: 2
 *                     createdAt: "2026-08-27T10:00:00.000Z"
 *                     updatedAt: "2026-08-28T12:00:00.000Z"
 *                 pagination:
 *                   total: 1
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 1
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Bukan ADMIN.
 */

/**
 * @openapi
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin - User]
 *     summary: Detail pengguna platform beserta riwayat undangan (admin)
 *     description: Menampilkan informasi lengkap profil pengguna, total undangan & tamu, serta daftar undangan yang pernah dibuat. Hanya dapat diakses oleh ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID pengguna.
 *     responses:
 *       200:
 *         description: Detail pengguna berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminUserDetailData'
 *             example:
 *               message: "Detail pengguna berhasil diambil"
 *               status: 200
 *               data:
 *                 id: "cly3k8a1b0000v8og3f1a1111"
 *                 fullName: "Fathur Saputra"
 *                 email: "fathur@example.com"
 *                 role: "USER"
 *                 planTier: "PRO"
 *                 createdAt: "2026-08-27T10:00:00.000Z"
 *                 updatedAt: "2026-08-28T12:00:00.000Z"
 *                 stats:
 *                   totalInvitations: 1
 *                   totalGuests: 150
 *                 invitations:
 *                   - id: "cly3k8a1b0000v8og3f1a2222"
 *                     title: "Pernikahan Ayu & Budi"
 *                     slug: "ayu-dan-budi"
 *                     status: "ACTIVE"
 *                     eventCategory: "WEDDING"
 *                     eventDate: "2026-10-15T00:00:00.000Z"
 *                     eventTime: "08:00 WIB"
 *                     venue: "Grand Ballroom Hotel Indonesia"
 *                     totalGuests: 150
 *                     createdAt: "2026-08-27T10:00:00.000Z"
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Bukan ADMIN.
 *       404:
 *         description: Pengguna tidak ditemukan.
 */

/**
 * @openapi
 * /admin/users/{id}/tier:
 *   patch:
 *     tags: [Admin - User]
 *     summary: Ubah paket tier pengguna secara manual (admin)
 *     description: Memperbarui paket langganan pengguna (FREE / PRO / MAX). Hanya dapat diakses oleh ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID pengguna yang ingin diubah paketnya.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserTierRequestBody'
 *     responses:
 *       200:
 *         description: Paket tier pengguna berhasil diperbarui.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfileData'
 *             example:
 *               message: "Paket tier pengguna berhasil diperbarui"
 *               status: 200
 *               data:
 *                 id: "cly3k8a1b0000v8og3f1a1111"
 *                 fullName: "Fathur Saputra"
 *                 email: "fathur@example.com"
 *                 role: "USER"
 *                 planTier: "MAX"
 *                 createdAt: "2026-08-27T10:00:00.000Z"
 *                 updatedAt: "2026-08-29T10:00:00.000Z"
 *       400:
 *         description: Validasi input gagal.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Bukan ADMIN.
 *       404:
 *         description: Pengguna tidak ditemukan.
 */

/**
 * @openapi
 * /admin/users/{id}/role:
 *   patch:
 *     tags: [Admin - User]
 *     summary: Ubah role pengguna (admin)
 *     description: Mempromosikan atau mencabut hak akses admin (USER / ADMIN). Dilengkapi proteksi keamanan agar admin tidak dapat mencabut hak akses admin dari akunnya sendiri. Hanya dapat diakses oleh ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID pengguna yang ingin diubah role-nya.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRoleRequestBody'
 *     responses:
 *       200:
 *         description: Role pengguna berhasil diperbarui.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfileData'
 *             example:
 *               message: "Role pengguna berhasil diperbarui"
 *               status: 200
 *               data:
 *                 id: "cly3k8a1b0000v8og3f1a1111"
 *                 fullName: "Fathur Saputra"
 *                 email: "fathur@example.com"
 *                 role: "ADMIN"
 *                 planTier: "FREE"
 *                 createdAt: "2026-08-27T10:00:00.000Z"
 *                 updatedAt: "2026-08-29T10:00:00.000Z"
 *       400:
 *         description: Validasi input gagal.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Mencoba mencabut role ADMIN dari akun sendiri atau bukan ADMIN.
 *       404:
 *         description: Pengguna tidak ditemukan.
 */

/**
 * @openapi
 * /admin/users/{id}/revoke-sessions:
 *   post:
 *     tags: [Admin - User]
 *     summary: Cabut semua sesi pengguna (admin)
 *     description: Memutus seluruh sesi login aktif (refresh token) milik pengguna tertentu untuk alasan keamanan atau pemblokiran paksa. Hanya dapat diakses oleh ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID pengguna yang ingin dicabut sesinya.
 *     responses:
 *       200:
 *         description: Semua sesi pengguna berhasil dicabut.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/RevokeUserSessionsData'
 *             example:
 *               message: "Semua sesi pengguna berhasil dicabut"
 *               status: 200
 *               data:
 *                 userId: "cly3k8a1b0000v8og3f1a1111"
 *                 revokedCount: 2
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Bukan ADMIN.
 *       404:
 *         description: Pengguna tidak ditemukan.
 */

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     tags: [Admin - User]
 *     summary: Hapus pengguna secara permanen (admin)
 *     description: Menghapus pengguna dan seluruh data terkait (undangan, tamu, ucapan/RSVP, buwuhan, sesi) secara permanen (cascade). Dilengkapi proteksi keamanan agar admin tidak dapat menghapus akunnya sendiri. Hanya dapat diakses oleh ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID pengguna yang ingin dihapus.
 *     responses:
 *       200:
 *         description: Pengguna berhasil dihapus secara permanen.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *             example:
 *               message: "Pengguna berhasil dihapus secara permanen"
 *               status: 200
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Mencoba menghapus akun sendiri atau bukan ADMIN.
 *       404:
 *         description: Pengguna tidak ditemukan.
 */
