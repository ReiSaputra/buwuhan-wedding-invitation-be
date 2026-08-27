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
 *       401:
 *         description: Token akses tidak ada / tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
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
 *       401:
 *         description: Token akses tidak ada / tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Template tidak ditemukan atau sudah nonaktif.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
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
