import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

// Mapea texto de mensaje (backend, EN o ES según el throw original) a un
// código estable que el frontend traduce a su propio idioma. Se hace por
// coincidencia de patrón en vez de tocar cada `throw` existente uno por uno.
const CODE_RULES: Array<{ pattern: RegExp; code: string }> = [
  { pattern: /no.?file|falta el archivo/i, code: 'NO_FILE' },
  {
    pattern: /debe ser un (pdf|archivo pdf)|only pdf files are allowed/i,
    code: 'INVALID_FILE_TYPE',
  },
  { pattern: /debe ser un archivo excel/i, code: 'INVALID_FILE_TYPE' },
  { pattern: /todos los archivos deben ser pdfs/i, code: 'INVALID_FILE_TYPE' },
  {
    pattern: /password.*(4 characters|caracteres)/i,
    code: 'PASSWORD_TOO_SHORT',
  },
  {
    pattern: /debe proporcionar al menos 2 archivos/i,
    code: 'MERGE_MIN_FILES',
  },
  { pattern: /debe especificar las p[aá]ginas/i, code: 'PAGES_REQUIRED' },
  { pattern: /m[aá]ximo permitido.*mb/i, code: 'FILE_TOO_LARGE' },
  { pattern: /m[aá]ximo permitido.*p[aá]ginas/i, code: 'TOO_MANY_PAGES' },
  { pattern: /no se pudo extraer texto|ocr/i, code: 'OCR_REQUIRED' },
  {
    pattern:
      /falta (deepseek|gemini|cohere)_api_key|proveedor llm no soportado|ollama\/hf_token/i,
    code: 'SERVER_MISCONFIGURED',
  },
  {
    pattern: /devolvi[oó] respuesta vac[ií]a|error \d{3}:/i,
    code: 'AI_PROVIDER_ERROR',
  },
  { pattern: /el texto es demasiado largo/i, code: 'TEXT_TOO_LONG' },
];

function resolveCode(message: string): string {
  const found = CODE_RULES.find((r) => r.pattern.test(message));
  return found?.code ?? 'UNKNOWN_ERROR';
}

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = isHttp ? exception.getResponse() : null;
    const rawMessage =
      typeof body === 'string'
        ? body
        : ((body as any)?.message ??
          (exception as any)?.message ??
          'Internal server error');

    // class-validator devuelve un array de mensajes; nos quedamos con el primero
    const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;

    res.status(status).json({
      statusCode: status,
      code: resolveCode(String(message)),
      message,
    });
  }
}
