// src/lib/PdfEncryptBackendClient.ts
import { ApiError, throwApiError } from './api-error';

export class PdfEncryptBackendClient {
  private baseUrl: string;

  constructor() {
    // URL de tu backend NestJS
this.baseUrl = '';
  }

  /**
   * Encripta un PDF usando el backend con encriptación real
   */
  async encrypt(file: File, password: string): Promise<Blob> {
    if (!file) {
      throw new ApiError('NO_FILE', 'No file provided');
    }

    if (file.type !== 'application/pdf') {
      throw new ApiError('INVALID_FILE_TYPE', 'Only PDF files are supported');
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB
      throw new ApiError('FILE_TOO_LARGE', 'File too large (maximum 100MB)');
    }

    if (!password || password.length < 4) {
      throw new ApiError('PASSWORD_TOO_SHORT', 'Password must be at least 4 characters long');
    }

    // Crear FormData para envío multipart
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('password', password);

    // Enviar al backend
    const response = await fetch(`${this.baseUrl}/api/pdf-encrypt/encrypt`, {
      method: 'POST',
      body: formData,
      // No agregues Content-Type header, el navegador lo hará automáticamente con boundary
    });

    if (!response.ok) {
      await throwApiError(response);
    }

    // Verificar que la respuesta sea un PDF
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/pdf')) {
      throw new ApiError('UNKNOWN_ERROR', 'Invalid response format from server');
    }

    // Obtener el blob del PDF encriptado
    const encryptedBlob = await response.blob();

    if (encryptedBlob.size === 0) {
      throw new ApiError('UNKNOWN_ERROR', 'Encrypted PDF is empty');
    }

    return encryptedBlob;
  }

  /**
   * Verifica el estado del servicio de encriptación
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/pdf-encrypt/health`, {
        method: 'POST',
      });
      
      return response.ok;
    } catch (error) {
      console.error('[Backend] Health check failed:', error);
      return false;
    }
  }

  /**
   * Obtiene información del servicio
   */
  async getServiceInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/pdf-encrypt/health`, {
        method: 'POST',
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Service unavailable');
    } catch (error) {
      console.error('[Backend] Service info error:', error);
      return null;
    }
  }
}