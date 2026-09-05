/**
 * @openapi
 * tags:
 *   - name: Subscriptions
 *     description: Manajemen paket langganan, checkout, invoice, dan webhook pembayaran Midtrans
 *   - name: Admin Subscriptions
 *     description: Manajemen langganan pengguna oleh Administrator
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     PlanData:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: "PRO"
 *         name:
 *           type: string
 *           example: "Paket Pro"
 *         price:
 *           type: number
 *           example: 49000
 *         currency:
 *           type: string
 *           example: "IDR"
 *         period:
 *           type: string
 *           enum: [MONTHLY, YEARLY]
 *           example: "MONTHLY"
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Hingga 5 undangan aktif", "Maksimal 500 tamu per undangan"]
 *         isActive:
 *           type: boolean
 *           example: true
 *         tier:
 *           type: string
 *           enum: [FREE, PRO, MAX]
 *           example: "PRO"
 *
 *     SubscriptionData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cm0123456789"
 *         planCode:
 *           type: string
 *           example: "PRO"
 *         plan:
 *           $ref: '#/components/schemas/PlanData'
 *         status:
 *           type: string
 *           enum: [PENDING, ACTIVE, EXPIRED, CANCELLED]
 *           example: "ACTIVE"
 *         startedAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         provider:
 *           type: string
 *           enum: [MIDTRANS]
 *           example: "MIDTRANS"
 *         providerRef:
 *           type: string
 *           example: "SUB-cm0123-1725500000"
 *
 *     InvoiceData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         subscriptionId:
 *           type: string
 *         amount:
 *           type: number
 *           example: 49000
 *         currency:
 *           type: string
 *           example: "IDR"
 *         status:
 *           type: string
 *           enum: [PENDING, PAID, FAILED, EXPIRED]
 *         paidAt:
 *           type: string
 *           format: date-time
 *         idempotencyKey:
 *           type: string
 *
 *     CheckoutRequestBody:
 *       type: object
 *       required: [planCode]
 *       properties:
 *         planCode:
 *           type: string
 *           enum: [PRO, MAX]
 *           example: "PRO"
 */

/**
 * @openapi
 * /plans:
 *   get:
 *     summary: Daftar paket langganan yang aktif
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar paket
 */

/**
 * @openapi
 * /subscriptions/me:
 *   get:
 *     summary: Mendapatkan informasi langganan aktif pengguna yang login
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Detail langganan pengguna
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /subscriptions/checkout:
 *   post:
 *     summary: Checkout paket langganan dan buat Midtrans Snap token
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequestBody'
 *     responses:
 *       201:
 *         description: Token Snap berhasil digenerate
 *       400:
 *         description: Input tidak valid
 *       409:
 *         description: Sudah memiliki langganan aktif
 */

/**
 * @openapi
 * /invoices/me:
 *   get:
 *     summary: Riwayat invoice pengguna yang login
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar invoice pengguna
 */

/**
 * @openapi
 * /webhooks/payment:
 *   post:
 *     summary: Webhook penerima notifikasi status pembayaran dari Midtrans (Idempotent)
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: Notifikasi berhasil diproses atau diabaikan (jika duplikat)
 *       400:
 *         description: Signature key invalid
 */
