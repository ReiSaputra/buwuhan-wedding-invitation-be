/**
 * @openapi
 * components:
 *   schemas:
 *     UploadImageData:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           example: "http://localhost:3000/uploads/images/1725700000000-a1b2c3d4.webp"
 *
 *     UploadImageSuccessEnvelope:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Gambar berhasil diunggah"
 *         status:
 *           type: integer
 *           example: 201
 *         data:
 *           $ref: '#/components/schemas/UploadImageData'
 */

/**
 * @openapi
 * /uploads/images:
 *   post:
 *     tags: [Upload]
 *     summary: Unggah berkas gambar (Cover, Galeri, Kisah Cinta, QRIS)
 *     summary: Unggah berkas gambar (Cover, Galeri, Cerita/Story, QRIS)
 *     description: Mengunggah berkas gambar dengan batasan ukuran 5 MB dan format JPEG, PNG, atau WebP. Membutuhkan autentikasi pengguna.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Berkas gambar yang diunggah (JPEG, PNG, WebP, maks 5 MB).
 *               folder:
 *                 type: string
 *                 enum: [images, qris]
 *                 default: images
 *                 description: Folder kategori tujuan penyimpanan gambar.
 *     responses:
 *       201:
 *         description: Berkas gambar berhasil diunggah.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadImageSuccessEnvelope'
 *       401:
 *         description: Unauthorized - Token akses tidak ada atau tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       422:
 *         description: Validasi gagal (format tidak didukung, ukuran melebihi 5 MB, atau folder tidak valid).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       429:
 *         description: Terlalu banyak unggahan berkas, coba lagi nanti.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 */
