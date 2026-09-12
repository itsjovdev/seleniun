import { Body, Controller, Post, Res, Req, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { GenerateDto } from './ai.dto';
import { Request, Response } from 'express';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  /**
   * POST /api/ai/generate
   * Límite: 8 req / IP / minuto (perfil "ai" del ThrottlerModule)
   */
  @Post('generate')
  @HttpCode(200)
  @Throttle({ ai: { ttl: 60_000, limit: 8 } })
  async generate(@Body() dto: GenerateDto) {
    const { prompt, system, temperature, maxTokens } = dto;
    return this.ai.generate(prompt, system, temperature, maxTokens);
  }

  /**
   * POST /api/ai/generate/stream
   * Límite estricto: 8 req / IP / minuto
   *
   * ⚠️  Este endpoint llama a DeepSeek (coste real por token).
   *     No tiene CORS manual (ya está gestionado globalmente en main.ts).
   */
  @Post('generate/stream')
  @Throttle({ ai: { ttl: 60_000, limit: 8 } })
  async generateStream(
    @Body() dto: GenerateDto,
    @Req() _req: Request,
    @Res() res: Response,
  ) {
    const { prompt, system, temperature, maxTokens } = dto;

    try {
      // ⚠️  Primero esperamos que DeepSeek responda con 200 antes de
      //     hacer commit de los headers. Así, si DeepSeek falla, podemos
      //     devolver un 500 real con el mensaje de error.
      const stream = await this.ai.streamGenerate(
        prompt,
        system,
        temperature,
        maxTokens ?? 4000,
      );

      // Solo ahora sabemos que DeepSeek acepta la petición → enviamos headers
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Accel-Buffering', 'no');

      stream.on('error', (e) => {
        console.error('Stream error:', e);
        if (!res.headersSent) {
          res
            .status(500)
            .json({ message: 'Streaming error', detail: e.message });
        } else {
          try {
            res.end();
          } catch {}
        }
      });

      stream.pipe(res);
    } catch (e: any) {
      const detail = e?.message ?? 'Unknown error';
      console.error('generateStream error:', detail);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error generating content.', detail });
      }
    }
  }
}
