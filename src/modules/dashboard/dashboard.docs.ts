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
 *
 *     AdminDashboardUsersStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 1250
 *         byTier:
 *           type: object
 *           properties:
 *             FREE: { type: integer, example: 980 }
 *             PRO: { type: integer, example: 210 }
 *             MAX: { type: integer, example: 60 }
 *         byRole:
 *           type: object
 *           properties:
 *             USER: { type: integer, example: 1245 }
 *             ADMIN: { type: integer, example: 5 }
 *
 *     AdminDashboardInvitationsStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 1420
 *         byStatus:
 *           type: object
 *           properties:
 *             DRAFT: { type: integer, example: 320 }
 *             ACTIVE: { type: integer, example: 950 }
 *             COMPLETED: { type: integer, example: 150 }
 *         byCategory:
 *           type: object
 *           properties:
 *             WEDDING: { type: integer, example: 1200 }
 *             KHITANAN: { type: integer, example: 150 }
 *             RASULAN: { type: integer, example: 50 }
 *             AQIQAH: { type: integer, example: 20 }
 *
 *     AdminDashboardGuestsStats:
 *       type: object
 *       properties:
 *         totalGuests:
 *           type: integer
 *           example: 45000
 *         totalCheckedIn:
 *           type: integer
 *           example: 31200
 *         totalRsvps:
 *           type: integer
 *           example: 28900
 *         byRsvpStatus:
 *           type: object
 *           properties:
 *             CONFIRMED: { type: integer, example: 24500 }
 *             DECLINED: { type: integer, example: 4400 }
 *
 *     TopTemplateItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "tpl-royal-floral"
 *         name:
 *           type: string
 *           example: "Royal Floral"
 *         slug:
 *           type: string
 *           example: "royal-floral"
 *         tier:
 *           type: string
 *           enum: [FREE, PRO, MAX]
 *           example: "FREE"
 *         previewImageUrl:
 *           type: string
 *           example: "https://storage.buwuhan.com/templates/royal-floral.jpg"
 *         usageCount:
 *           type: integer
 *           example: 420
 *
 *     AdminDashboardStatsData:
 *       type: object
 *       properties:
 *         users:
 *           $ref: '#/components/schemas/AdminDashboardUsersStats'
 *         invitations:
 *           $ref: '#/components/schemas/AdminDashboardInvitationsStats'
 *         guests:
 *           $ref: '#/components/schemas/AdminDashboardGuestsStats'
 *         topTemplates:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TopTemplateItem'
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

/**
 * @openapi
 * /admin/dashboard/stats:
 *   get:
 *     tags: [Admin - Dashboard]
 *     summary: Ambil metrik agregat statistik platform global (admin)
 *     description: Mengembalikan data statistik makro mencakup total user & tier/role breakdown, total undangan & status/kategori breakdown, tamu & RSVP, serta 5 template terpopuler. Hanya dapat diakses oleh ADMIN.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik platform berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminDashboardStatsData'
 *             example:
 *               message: "Statistik platform berhasil diambil"
 *               status: 200
 *               data:
 *                 users:
 *                   total: 1250
 *                   byTier:
 *                     FREE: 980
 *                     PRO: 210
 *                     MAX: 60
 *                   byRole:
 *                     USER: 1245
 *                     ADMIN: 5
 *                 invitations:
 *                   total: 1420
 *                   byStatus:
 *                     DRAFT: 320
 *                     ACTIVE: 950
 *                     COMPLETED: 150
 *                   byCategory:
 *                     WEDDING: 1200
 *                     KHITANAN: 150
 *                     RASULAN: 50
 *                     AQIQAH: 20
 *                 guests:
 *                   totalGuests: 45000
 *                   totalCheckedIn: 31200
 *                   totalRsvps: 28900
 *                   byRsvpStatus:
 *                     CONFIRMED: 24500
 *                     DECLINED: 4400
 *                 topTemplates:
 *                   - id: "tpl-royal-floral"
 *                     name: "Royal Floral"
 *                     slug: "royal-floral"
 *                     tier: "FREE"
 *                     previewImageUrl: "https://storage.buwuhan.com/templates/royal-floral.jpg"
 *                     usageCount: 420
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Bukan ADMIN.
 */
