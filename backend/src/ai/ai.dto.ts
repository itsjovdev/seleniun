import {
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GenerateDto {
  /**
   * El prompt del usuario.
   * Mín: 3 chars  ← evita llamadas vacías / de prueba
   * Máx: 2 000 chars ← limita tokens de entrada y coste
   */
  @IsString()
  @MinLength(3, { message: 'El prompt debe tener al menos 3 caracteres.' })
  @MaxLength(2000, { message: 'El prompt no puede superar 2 000 caracteres.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  prompt: string;

  /**
   * El system prompt.
   * Máx: 3 000 chars — más que suficiente para instrucciones de formato.
   */
  @IsOptional()
  @IsString()
  @MaxLength(3000, {
    message: 'El system prompt no puede superar 3 000 caracteres.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  system?: string;

  /**
   * Temperatura de generación.
   * Rango válido: 0.0 – 1.0
   * Valores fuera de rango podrían aumentar costes o generar respuestas inesperadas.
   */
  @IsOptional()
  @IsNumber({}, { message: 'temperature debe ser un número.' })
  @Min(0, { message: 'temperature mínima: 0.' })
  @Max(1, { message: 'temperature máxima: 1.' })
  temperature?: number;

  @IsOptional()
  @IsNumber({}, { message: 'maxTokens debe ser un número.' })
  @Min(50, { message: 'maxTokens mínimo: 50.' })
  @Max(4000, { message: 'maxTokens máximo: 4000.' })
  maxTokens?: number;
}
