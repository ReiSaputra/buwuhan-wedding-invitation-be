/**
 * @openapi
 * components:
 *   schemas:
 *     DashboardInvitationItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cly3k8a1b0000v8og3f1a1111"
 *         title:
 *           type: string
 *           example: "Han & Saputra"
 *         slug:
 *           type: string
 *           example: "han-dan-saputra"
 *         status:
 *           type: string
 *           enum: [DRAFT, ACTIVE, COMPLETED]
 *           example: "ACTIVE"
 *         eventDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-01-18T00:00:00.000Z"
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
 *           example: "Jl. Sudirman No. 1, Jakarta"
 *         templateThumbnail:
 *           type: string
 *           nullable: true
 *           example: "https://storage.buwuhan.com/templates/floral-preview.jpg"
 *         totalGuests:
 *           type: integer
 *           example: 1000
 *         totalCheckedIn:
 *           type: integer
 *           example: 731
 *         checkInPercentage:
 *           type: integer
 *           example: 73
 *
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalInvitations:
 *           type: integer
 *           example: 2
 *         totalGuests:
 *           type: integer
 *           example: 1240
 *         totalCheckedIn:
 *           type: integer
 *           example: 731
 *
 *     DashboardData:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             fullName:
 *               type: string
 *               example: "Fathur Saputra"
 *             planTier:
 *               type: string
 *               enum: [FREE, PRO, MAX]
 *               example: "FREE"
 *         stats:
 *           $ref: '#/components/schemas/DashboardStats'
 *         invitations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DashboardInvitationItem'
 */

/**
 * @openapi
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Ambil data ringkasan dashboard host
 *     description: Mengambil data profil user, agregat statistik undangan & tamu, serta daftar kartu undangan milik host.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data dashboard berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DashboardData'
 *             example:
 *               message: "Data dashboard berhasil diambil"
 *               status: 200
 *               data:
 *                 user:
 *                   fullName: "Fathur Saputra"
 *                   planTier: "FREE"
 *                 stats:
 *                   totalInvitations: 2
 *                   totalGuests: 1240
 *                   totalCheckedIn: 731
 *                 invitations:
 *                   - id: "cly3k8a1b0000v8og3f1a1111"
 *                     title: "Han & Saputra"
 *                     slug: "han-dan-saputra"
 *                     status: "ACTIVE"
 *                     eventDate: "2026-01-18T00:00:00.000Z"
 *                     eventTime: "07:00 WIB"
 *                     venue: "Grand Ballroom Hotel Indonesia"
 *                     address: "Jl. Sudirman No. 1, Jakarta"
 *                     templateThumbnail: "https://storage.buwuhan.com/templates/floral-preview.jpg"
 *                     totalGuests: 1000
 *                     totalCheckedIn: 731
 *                     checkInPercentage: 73
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 */
