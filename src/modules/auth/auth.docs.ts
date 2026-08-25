// Taruh file ini di: src/modules/auth/auth.docs.ts
//
// File ini TIDAK mengekspor apa pun yang dipakai runtime — isinya murni
// JSDoc comment block (@openapi) yang di-scan oleh swagger-jsdoc lewat glob
// "./src/modules/**/*.docs.ts" di src/config/swagger.config.ts.
//
// Alasan dipisah dari auth.routes.ts: supaya file routes tetap ringkas
// (cuma routing), dan dokumentasi bisa berkembang tanpa bikin file routes
// jadi raksasa. Pola ini bisa kamu ulang untuk modul lain:
// src/modules/invitation/invitation.docs.ts, guest.docs.ts, rsvp.docs.ts, dst.

/**
 * @openapi
 * components:
 *   schemas:
 *     RegisterRequestBody:
 *       type: object
 *       required: [fullName, email, password]
 *       properties:
 *         fullName:
 *           type: string
 *           example: "Ayu Lestari"
 *         email:
 *           type: string
 *           format: email
 *           example: "ayu@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: Minimal 8 karakter, wajib mengandung huruf dan angka.
 *           example: "Rahasia123"
 *
 *     RegisterResponseData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: cuid (Prisma default `@default(cuid())`), BUKAN UUID.
 *           example: "cly3k9h2p0000v8og3f1a7x2q"
 *         fullName:
 *           type: string
 *           example: "Ayu Lestari"
 *         email:
 *           type: string
 *           example: "ayu@example.com"
 *
 *     LoginRequestBody:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "ayu@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "Rahasia123"
 *
 *     LoginResponseData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: cuid (Prisma default `@default(cuid())`), BUKAN UUID.
 *           example: "cly3k9h2p0000v8og3f1a7x2q"
 *         fullName:
 *           type: string
 *         email:
 *           type: string
 *         accessToken:
 *           type: string
 *           description: >
 *             JWT access token untuk endpoint yang butuh autentikasi.
 *             Refresh token TIDAK ikut di body ini — dikirim terpisah
 *             lewat header Set-Cookie (httpOnly), lihat deskripsi endpoint login.
 *
 *     RefreshTokenResponseData:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Access token baru hasil rotasi refresh token.
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrasi user baru
 *     description: Membuat akun user baru. Endpoint ini publik (tidak butuh token) dan dibatasi rate limit 5 request/jam per IP.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequestBody'
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     status: { type: integer, example: 201 }
 *                     data:
 *                       $ref: '#/components/schemas/RegisterResponseData'
 *       400:
 *         description: Validasi gagal — format email tidak valid, atau password tidak memenuhi syarat (minimal 8 karakter, wajib huruf & angka).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       409:
 *         description: Email sudah terdaftar.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     description: >
 *       Endpoint ini publik (tidak butuh token) dan dibatasi rate limit 10 request/15 menit per IP.
 *
 *       **Penting soal token:** access token dikembalikan di response body (field `accessToken`).
 *       Refresh token TIDAK ada di body — dikirim oleh server lewat header `Set-Cookie`
 *       (httpOnly, sameSite=strict, path `/v1/auth`, max-age 7 hari). Client tidak perlu dan
 *       tidak bisa membaca refresh token lewat JavaScript; browser akan otomatis mengirimkannya
 *       kembali saat memanggil `/v1/auth/refresh-token` atau `/v1/auth/logout`.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequestBody'
 *     responses:
 *       200:
 *         description: Login berhasil.
 *         headers:
 *           Set-Cookie:
 *             description: "refreshToken=<value>; HttpOnly; SameSite=Strict; Path=/v1/auth; Max-Age=604800"
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoginResponseData'
 *       400:
 *         description: Validasi gagal (format request body salah).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       401:
 *         description: Email atau password salah (pesan generik, tidak membedakan field mana yang salah).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 */

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Rotasi access token & refresh token
 *     description: >
 *       Membaca refresh token dari httpOnly cookie (bukan dari body request — endpoint ini
 *       tidak menerima body). Session lama di-revoke, session baru dibuat (refresh token rotation),
 *       cookie `refreshToken` di-update dengan nilai baru, dan access token baru dikembalikan di body.
 *       Dibatasi rate limit 30 request/15 menit per IP.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Rotasi berhasil.
 *         headers:
 *           Set-Cookie:
 *             description: "refreshToken=<value_baru>; HttpOnly; SameSite=Strict; Path=/v1/auth; Max-Age=604800"
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/RefreshTokenResponseData'
 *       401:
 *         description: Cookie refresh token tidak ada, tidak valid, atau sudah kedaluwarsa/di-revoke.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 */

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     description: >
 *       Membaca refresh token dari httpOnly cookie, me-revoke session terkait di database,
 *       lalu menghapus cookie `refreshToken` dari browser. Tidak menerima body request.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil.
 *         headers:
 *           Set-Cookie:
 *             description: "refreshToken=; HttpOnly; SameSite=Strict; Path=/v1/auth; Max-Age=0 (cookie dihapus)"
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 */
