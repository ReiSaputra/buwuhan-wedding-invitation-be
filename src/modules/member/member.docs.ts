// Taruh file ini di: src/modules/member/member.docs.ts
//
// File ini murni JSDoc comment block (@openapi) yang di-scan otomatis oleh
// swagger-jsdoc lewat glob di src/config/swagger.config.ts.

/**
 * @openapi
 * components:
 *   schemas:
 *     InvitationRoleEnum:
 *       type: string
 *       enum: [OWNER, ADMIN, USER]
 *       description: |
 *         Peran petugas/co-host pada undangan:
 *         * `OWNER` - Pemilik penuh undangan (mengelola anggota, kuota, menghapus undangan).
 *         * `ADMIN` - Pengelola acara (mengedit konten undangan, mengelola buku tamu/RSVP/gift).
 *         * `USER` - Petugas penerima tamu (khusus scan QR check-in/out dan melihat daftar tamu).
 *       example: "USER"
 *
 *     InviteMemberRequestBody:
 *       type: object
 *       required: [email, name]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Alamat email calon petugas.
 *           example: "petugas@example.com"
 *         name:
 *           type: string
 *           description: Nama lengkap calon petugas.
 *           example: "Budi Santoso"
 *         role:
 *           $ref: '#/components/schemas/InvitationRoleEnum'
 *           default: "USER"
 *
 *     UpdateMemberRoleRequestBody:
 *       type: object
 *       required: [role]
 *       properties:
 *         role:
 *           $ref: '#/components/schemas/InvitationRoleEnum'
 *
 *     AcceptInviteRequestBody:
 *       type: object
 *       required: [token]
 *       properties:
 *         token:
 *           type: string
 *           description: Token rahasia sekali pakai yang diterima melalui email.
 *           example: "a1b2c3d4e5f60718293a4b5c6d7e8f90"
 *
 *     MemberItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cm123member001"
 *         invitationId:
 *           type: string
 *           example: "cm123invitation001"
 *         userId:
 *           type: string
 *           nullable: true
 *           example: "cm123user001"
 *         email:
 *           type: string
 *           example: "petugas@example.com"
 *         name:
 *           type: string
 *           example: "Budi Santoso"
 *         role:
 *           $ref: '#/components/schemas/InvitationRoleEnum'
 *         invitedAt:
 *           type: string
 *           format: date-time
 *         acceptedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         revokedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         isAccepted:
 *           type: boolean
 *           example: false
 *         isRevoked:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     MemberItemResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Petugas berhasil diundang"
 *         status:
 *           type: integer
 *           example: 201
 *         data:
 *           $ref: '#/components/schemas/MemberItem'
 *
 *     MemberListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Daftar petugas berhasil diambil"
 *         status:
 *           type: integer
 *           example: 200
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MemberItem'
 *
 *     ResendInviteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Undangan petugas berhasil dikirim ulang"
 *         status:
 *           type: integer
 *           example: 200
 *         data:
 *           type: object
 *           properties:
 *             memberId:
 *               type: string
 *               example: "cm123member001"
 *             email:
 *               type: string
 *               example: "petugas@example.com"
 *             name:
 *               type: string
 *               example: "Budi Santoso"
 *
 *     AcceptInviteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Undangan petugas berhasil diterima"
 *         status:
 *           type: integer
 *           example: 200
 *         data:
 *           type: object
 *           properties:
 *             memberId:
 *               type: string
 *               example: "cm123member001"
 *             invitationId:
 *               type: string
 *               example: "cm123invitation001"
 *             invitationSlug:
 *               type: string
 *               example: "romeo-juliet"
 *             invitationTitle:
 *               type: string
 *               example: "Pernikahan Romeo & Juliet"
 *             role:
 *               $ref: '#/components/schemas/InvitationRoleEnum'
 */

/**
 * @openapi
 * /invitations/{invitationId}/members:
 *   post:
 *     summary: Mengundang petugas baru (co-host / usher)
 *     description: |
 *       Hanya dapat diakses oleh **OWNER** undangan.
 *       Sistem akan membuat record petugas dan mengirimkan email undangan berisi token akses.
 *     tags:
 *       - Members / Petugas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InviteMemberRequestBody'
 *     responses:
 *       201:
 *         description: Petugas berhasil diundang dan email telah dikirim.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberItemResponse'
 *       400:
 *         description: Format data request tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       403:
 *         description: Tidak memiliki izin (bukan OWNER).
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
 *       409:
 *         description: Petugas sudah aktif atau email adalah milik pemilik undangan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 *   get:
 *     summary: Mengambil daftar seluruh petugas pada undangan
 *     description: Dapat diakses oleh **OWNER** dan **ADMIN** undangan.
 *     tags:
 *       - Members / Petugas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID undangan
 *     responses:
 *       200:
 *         description: Daftar petugas berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberListResponse'
 *       403:
 *         description: Tidak memiliki izin akses.
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
 *
 * /invitations/{invitationId}/members/{id}:
 *   get:
 *     summary: Mengambil detail satu petugas
 *     description: Dapat diakses oleh **OWNER** dan **ADMIN** undangan.
 *     tags:
 *       - Members / Petugas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID petugas
 *     responses:
 *       200:
 *         description: Detail petugas berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberItemResponse'
 *       403:
 *         description: Tidak memiliki izin akses.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Petugas tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 *   patch:
 *     summary: Memperbarui peran (role) petugas
 *     description: Hanya dapat diakses oleh **OWNER** undangan.
 *     tags:
 *       - Members / Petugas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMemberRoleRequestBody'
 *     responses:
 *       200:
 *         description: Peran petugas berhasil diperbarui.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberItemResponse'
 *       403:
 *         description: Tidak memiliki izin akses (bukan OWNER).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Petugas tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 *   delete:
 *     summary: Menghapus petugas dari undangan
 *     description: Hanya dapat diakses oleh **OWNER** undangan.
 *     tags:
 *       - Members / Petugas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Petugas berhasil dihapus.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEnvelope'
 *       403:
 *         description: Tidak memiliki izin akses (bukan OWNER).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Petugas tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 * /invitations/{invitationId}/members/{id}/resend:
 *   post:
 *     summary: Mengirim ulang email undangan kepada petugas yang belum menerima
 *     description: Hanya dapat diakses oleh **OWNER** undangan.
 *     tags:
 *       - Members / Petugas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email undangan berhasil dikirim ulang.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResendInviteResponse'
 *       403:
 *         description: Tidak memiliki izin akses.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Petugas atau undangan tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       409:
 *         description: Petugas sudah menerima undangan sebelumnya.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *
 * /members/accept:
 *   post:
 *     summary: Menerima undangan menjadi petugas
 *     description: |
 *       Dapat diakses oleh user yang sedang login menggunakan access token JWT.
 *       Token undangan yang dikirim lewat email hanya dapat digunakan **satu kali**.
 *     tags:
 *       - Members / Petugas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcceptInviteRequestBody'
 *     responses:
 *       200:
 *         description: Undangan berhasil diterima.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcceptInviteResponse'
 *       400:
 *         description: Format request tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       401:
 *         description: Belum terautentikasi (wajib login terlebih dahulu).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       404:
 *         description: Token undangan tidak valid atau tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 *       422:
 *         description: Token undangan sudah kedaluwarsa.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEnvelope'
 */

