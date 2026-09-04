// Taruh file ini di: src/modules/template/template.docs.ts

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateTemplateRequestBody:
 *       type: object
 *       required: [name, slug, tier, previewImageUrl]
 *       properties:
 *         name:
 *           type: string
 *           example: "Elegant Floral"
 *         slug:
 *           type: string
 *           example: "elegant-floral"
 *         tier:
 *           type: string
 *           enum: [FREE, PRO, MAX]
 *         eventCategory:
 *           type: string
 *           enum: [WEDDING, KHITANAN, RASULAN, AQIQAH]
 *           description: Kategori jenis acara (default WEDDING).
 *           example: "WEDDING"
 *         previewImageUrl:
 *           type: string
 *           format: url
 *         isActive:
 *           type: boolean
 *           description: Default true kalau tidak dikirim.
 *
 *     UpdateTemplateRequestBody:
 *       type: object
 *       description: Semua field opsional, minimal satu harus diisi.
 *       properties:
 *         name: { type: string }
 *         slug: { type: string }
 *         tier: { type: string, enum: [FREE, PRO, MAX] }
 *         eventCategory: { type: string, enum: [WEDDING, KHITANAN, RASULAN, AQIQAH] }
 *         previewImageUrl: { type: string, format: url }
 *         isActive: { type: boolean }
 *
 *     TemplateData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: cuid, BUKAN UUID.
 *         name: { type: string }
 *         slug: { type: string }
 *         tier: { type: string, enum: [FREE, PRO, MAX] }
 *         eventCategory: { type: string, enum: [WEDDING, KHITANAN, RASULAN, AQIQAH] }
 *         previewImageUrl: { type: string }
 *         isActive: { type: boolean }
 *         isAccessible:
 *           type: boolean
 *           description: Dihitung dari planTier user yang sedang login (dari token) dibanding tier template ini.
 */

/**
 * @openapi
 * /templates:
 *   get:
 *     tags: [Template]
 *     summary: Daftar template yang tersedia (untuk panel pembuat undangan)
 *     description: Hanya menampilkan template yang aktif. Butuh login (semua role), tidak khusus admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *           enum: [WEDDING, KHITANAN, RASULAN, AQIQAH]
 *         description: Filter template berdasarkan kategori acara (misal WEDDING, KHITANAN, RASULAN, AQIQAH).
 *     responses:
 *       200:
 *         description: Daftar template berhasil diambil.
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
 *                         $ref: '#/components/schemas/TemplateData'
 *             example:
 *               message: "Daftar template berhasil diambil"
 *               status: 200
 *               data:
 *                 - id: "cmthdqg120001zozxnaa5bq7e"
 *                   name: "Royal Floral"
 *                   slug: "royal-floral"
 *                   tier: "FREE"
 *                   eventCategory: "WEDDING"
 *                   previewImageUrl: "https://storage.buwuhan.com/templates/royal-floral.jpg"
 *                   isActive: true
 *                   isAccessible: true
 *                 - id: "cmthdqg120002zozxnaa5bq7f"
 *                   name: "Elegant Gold"
 *                   slug: "elegant-gold"
 *                   tier: "PRO"
 *                   eventCategory: "WEDDING"
 *                   previewImageUrl: "https://storage.buwuhan.com/templates/elegant-gold.jpg"
 *                   isActive: true
 *                   isAccessible: false
 *                 - id: "cmtidcwyf0004eczxbd42xbd7"
 *                   name: "Khitanan Ceria Blue"
 *                   slug: "khitanan-ceria-blue"
 *                   tier: "FREE"
 *                   eventCategory: "KHITANAN"
 *                   previewImageUrl: "https://storage.buwuhan.com/templates/khitanan-ceria-blue.jpg"
 *                   isActive: true
 *                   isAccessible: true
 *       401:
 *         description: Token akses tidak ada / tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Token akses tidak ditemukan"
 *   post:
 *     tags: [Template]
 *     summary: Buat template baru (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTemplateRequestBody'
 *     responses:
 *       201:
 *         description: Template berhasil dibuat.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     status: { type: integer, example: 201 }
 *                     data:
 *                       $ref: '#/components/schemas/TemplateData'
 *       400:
 *         description: Validasi gagal.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       401:
 *         description: Token akses tidak ada / tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       403:
 *         description: Bukan admin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       409:
 *         description: Slug sudah digunakan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 */

/**
 * @openapi
 * /templates/{slug}:
 *   get:
 *     tags: [Template]
 *     summary: Detail satu template (untuk panel pembuat undangan)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Template ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TemplateData'
 *             example:
 *               message: "Template ditemukan"
 *               status: 200
 *               data:
 *                 id: "cmthdqg120001zozxnaa5bq7e"
 *                 name: "Royal Floral"
 *                 slug: "royal-floral"
 *                 tier: "FREE"
 *                 eventCategory: "WEDDING"
 *                 previewImageUrl: "https://storage.buwuhan.com/templates/royal-floral.jpg"
 *                 isActive: true
 *                 isAccessible: true
 *       401:
 *         description: Token akses tidak ada / tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Token akses tidak ditemukan"
 *       404:
 *         description: Template tidak ditemukan atau sudah nonaktif.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *             example:
 *               success: false
 *               message: "Template tidak ditemukan"
 */

/**
 * @openapi
 * /templates/{id}:
 *   patch:
 *     tags: [Template]
 *     summary: Perbarui template (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTemplateRequestBody'
 *     responses:
 *       200:
 *         description: Template berhasil diperbarui.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TemplateData'
 *       401:
 *         description: Token akses tidak ada / tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       403:
 *         description: Bukan admin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Template tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       409:
 *         description: Slug baru sudah digunakan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *   delete:
 *     tags: [Template]
 *     summary: Nonaktifkan template (admin)
 *     description: Ini soft-delete (set `isActive=false`), bukan hapus permanen -- supaya undangan yang sudah memakai template ini tetap utuh.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Template berhasil dinonaktifkan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *       401:
 *         description: Token akses tidak ada / tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       403:
 *         description: Bukan admin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Template tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     AdminTemplateListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cmthdqg120001zozxnaa5bq7e"
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
 *         eventCategory:
 *           type: string
 *           enum: [WEDDING, KHITANAN, RASULAN, AQIQAH]
 *           example: "WEDDING"
 *         previewImageUrl:
 *           type: string
 *           example: "https://storage.buwuhan.com/templates/royal-floral.jpg"
 *         isActive:
 *           type: boolean
 *           example: true
 *         usageCount:
 *           type: integer
 *           description: Jumlah undangan yang menggunakan template ini.
 *           example: 42
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-15T00:00:00.000Z"
 */

/**
 * @openapi
 * /admin/templates:
 *   get:
 *     tags: [Admin - Template]
 *     summary: Daftar seluruh katalog template (admin)
 *     description: Menampilkan seluruh template (baik yang aktif maupun nonaktif) dengan metrik jumlah penggunaan (usageCount), serta filter pencarian, status aktif, tier, dan kategori acara. Hanya dapat diakses oleh ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter status aktif ("true" untuk aktif, "false" untuk nonaktif/diarsipkan).
 *       - in: query
 *         name: tier
 *         schema:
 *           type: string
 *           enum: [FREE, PRO, MAX]
 *         description: Filter berdasarkan paket tier.
 *       - in: query
 *         name: eventCategory
 *         schema:
 *           type: string
 *           enum: [WEDDING, KHITANAN, RASULAN, AQIQAH]
 *         description: Filter berdasarkan kategori acara.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian nama template atau slug.
 *     responses:
 *       200:
 *         description: Daftar seluruh template berhasil diambil.
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
 *                         $ref: '#/components/schemas/AdminTemplateListItem'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Bukan ADMIN.
 */

/**
 * @openapi
 * /admin/templates/{id}/restore:
 *   patch:
 *     tags: [Admin - Template]
 *     summary: Aktifkan kembali template yang dinonaktifkan (admin)
 *     description: "Mengembalikan template yang sebelumnya berstatus `isActive: false` (akibat soft delete) menjadi aktif kembali (`isActive: true`). Hanya dapat diakses oleh ADMIN."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID template (CUID).
 *     responses:
 *       200:
 *         description: Template berhasil diaktifkan kembali.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TemplateData'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Bukan ADMIN.
 *       404:
 *         description: Template tidak ditemukan.
 */
