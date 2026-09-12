// Error tipado que las páginas de herramientas lanzan al leer una respuesta
// no-ok del backend. `code` es el código estable que el backend agrega en
// { statusCode, code, message } (ver AppExceptionFilter en el backend).
export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// Lee el body de una Response no-ok del backend y lanza un ApiError con el
// código y mensaje que trae, o UNKNOWN_ERROR si el body no tiene ese formato
// (por ejemplo, un 502 de la propia infraestructura, no de nuestro backend).
export async function throwApiError(res: Response): Promise<never> {
  let code = 'UNKNOWN_ERROR';
  let message = `Error ${res.status}: ${res.statusText}`;
  try {
    const body = await res.json();
    if (body?.code) code = body.code;
    if (body?.message) message = body.message;
  } catch {
    // respuesta no-JSON (ej. HTML de un 502 de la infraestructura)
  }
  throw new ApiError(code, message);
}

// Traduce un error capturado en el catch() de una herramienta a texto
// mostrable. Usa el código si es un ApiError conocido; si no, cae al
// mensaje traducido genérico.
export function getErrorMessage(err: unknown, t: (key: string) => string): string {
  if (err instanceof ApiError) {
    const translated = t(`error.${err.code}`);
    // t() devuelve la key tal cual si no la encuentra en el diccionario
    return translated === `error.${err.code}` ? t('error.UNKNOWN_ERROR') : translated;
  }
  return t('error.UNKNOWN_ERROR');
}
