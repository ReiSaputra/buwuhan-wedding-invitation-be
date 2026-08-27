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
