import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppExceptionFilter } from './common/app-exception.filter';

process.on('uncaughtException', (err) => {
  console.error('💥 uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 unhandledRejection:', reason);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── 1. Cabeceras de seguridad HTTP (XSS, clickjacking, etc.) ────────────
  app.use(helmet());

  // ── 2. CORS — solo orígenes permitidos ──────────────────────────────────
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://localhost:3000',
      'https://seleniun.com',
      'https://www.seleniun.com',
      'https://document-intellisense.vercel.app',
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false,
  });

  // ── 2.5. Envuelve todo error en { statusCode, code, message } ──────────
  //    El "code" es estable y sirve para que el frontend traduzca el
  //    mensaje a su propio idioma en vez de mostrar el texto crudo.
  app.useGlobalFilters(new AppExceptionFilter());

  // ── 3. Validación global de DTOs ──────────────────────────────────────
  //    whitelist    → descarta campos no declarados en el DTO
  //    forbidNonWhitelisted → devuelve 400 si llegan campos extra
  //    transform    → convierte tipos automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── 4. Límite de tamaño del body JSON (protege el endpoint /ai) ─────────
  //    Sin esto, alguien puede enviar un prompt de 10 MB
  app.use(require('express').json({ limit: '64kb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '64kb' }));

  // ── 5. Prefijo global de rutas ──────────────────────────────────────────
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Backend running on http://0.0.0.0:${port}`);
  console.log(`🛡️  Security: helmet + rate-limit + validation enabled`);
}

bootstrap().catch((err) => {
  console.error('❌ Error starting server:', err);
  process.exit(1);
});
