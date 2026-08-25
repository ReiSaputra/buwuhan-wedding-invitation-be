// Taruh file ini di: src/config/swagger.config.ts
//
// File ini HANYA berisi definisi dasar OpenAPI (info, servers, security schemes,
// dan schema envelope generik) + konfigurasi glob yang di-scan swagger-jsdoc.
// Anotasi per-endpoint & schema spesifik modul TIDAK ditaruh di sini, tapi di
// file `*.docs.ts` masing-masing modul (lihat src/modules/auth/auth.docs.ts).

import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition: swaggerJsdoc.OAS3Definition = {
  openapi: "3.0.0",
  info: {
    title: "Buwuhan Wedding Invitation API",
    version: "1.0.0",
    description: "Dokumentasi API untuk aplikasi web undangan digital Buwuhan. " + "Mencakup pembuatan & pengaturan undangan pernikahan, pemilihan template, " + "serta fitur gift/buwuhan (bantuan barang yang dicatat sebagai nominal uang).",
  },
  servers: [
    {
      url: "http://localhost:3000/v1",
      description: "Local development",
    },
    // Tambahkan server staging/production di sini kalau sudah ada,
    // misal: { url: "https://api.buwuhan.app/v1", description: "Production" }
  ],
  components: {
    securitySchemes: {
      // Dipakai untuk endpoint yang butuh access token JWT di header Authorization
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      // Dipakai untuk mendokumentasikan endpoint yang membaca refresh token
      // dari httpOnly cookie (refresh-token, logout)
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "refreshToken",
      },
    },
    schemas: {
      // Envelope sukses generik: { message, status, data }
      SuccessEnvelope: {
        type: "object",
        required: ["message", "status", "data"],
        properties: {
          message: { type: "string", example: "OK" },
          status: { type: "integer", example: 200 },
          data: { type: "object" },
        },
      },
      // Envelope error generik dari errorHandler global: { success: false, message }
      ErrorEnvelope: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Terjadi kesalahan" },
        },
      },
    },
  },
  // Default: sebagian besar endpoint butuh bearer token.
  // Endpoint public (register/login) akan override ini dengan `security: []`
  // di anotasi masing-masing.
  security: [{ bearerAuth: [] }],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  // Scan semua file *.routes.ts DAN *.docs.ts di setiap modul.
  // Kalau kamu jalankan lewat ts-node dari root project, path relatif ini sudah pas.
  // Kalau di-build ke dist/, sesuaikan ke "./dist/modules/**/*.js" atau
  // pertahankan comment di source .ts dan tetap arahkan ke src saat scanning.
  apis: ["./src/modules/**/*.routes.ts", "./src/modules/**/*.docs.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
