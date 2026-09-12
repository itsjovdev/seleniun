import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConvertModule } from './convert/convert.module';
import { PdfModule } from './pdf/pdf.module';
import { PdfEncryptModule } from './pdf-encrypt/pdf-encrypt.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    // ── Rate limiting global ─────────────────────────────────────────────
    // Por defecto: 60 peticiones por minuto por IP para todas las rutas.
    // El endpoint /ai/generate/stream tiene su propio límite más estricto
    // definido con @Throttle() en su controlador.
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60_000, // ventana de 60 segundos
        limit: 60, // máx 60 req / IP / minuto (herramientas PDF)
      },
      {
        name: 'ai',
        ttl: 60_000, // ventana de 60 segundos
        limit: 8, // máx 8 llamadas IA / IP / minuto
      },
    ]),

    ConvertModule,
    PdfModule,
    PdfEncryptModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Aplica ThrottlerGuard globalmente a todos los endpoints
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
