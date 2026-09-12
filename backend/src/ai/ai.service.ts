import { Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';

@Injectable()
export class AiService {
  private readonly provider = (
    process.env.LLM_PROVIDER || 'deepseek'
  ).toLowerCase(); // 'deepseek' | 'gemini'

  private readonly deepseekApiKey = process.env.DEEPSEEK_API_KEY || '';
  private readonly deepseekModel = process.env.LLM_MODEL || 'deepseek-chat';

  private readonly geminiApiKey = process.env.GEMINI_API_KEY || '';
  private readonly geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  // Respuesta "entera"
  async generate(
    prompt: string,
    system?: string,
    temperature = 0.7,
    maxTokens = 700,
  ) {
    if (this.provider === 'gemini') {
      return this.generateGemini(prompt, system, temperature, maxTokens);
    }
    return this.generateDeepSeek(prompt, system, temperature, maxTokens);
  }

  private async generateDeepSeek(
    prompt: string,
    system?: string,
    temperature = 0.7,
    maxTokens = 700,
  ) {
    if (!this.deepseekApiKey) throw new Error('Falta DEEPSEEK_API_KEY');

    const body = {
      model: this.deepseekModel,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt },
      ],
      stream: false,
      temperature,
      max_tokens: maxTokens,
    };

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.deepseekApiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`DeepSeek error ${res.status}: ${err}`);
    }

    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content ?? '';
    return { text, raw: json };
  }

  private async generateGemini(
    prompt: string,
    system?: string,
    temperature = 0.7,
    maxTokens = 700,
  ) {
    if (!this.geminiApiKey) throw new Error('Falta GEMINI_API_KEY');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error ${res.status}: ${err}`);
    }

    const json = await res.json();
    const text =
      json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ??
      '';
    return { text, raw: json };
  }

  // 🔥 Streaming: devuelve un stream con el texto a medida que llega
  async streamGenerate(
    prompt: string,
    system?: string,
    temperature = 0.7,
    maxTokens = 200,
  ) {
    if (this.provider === 'gemini') {
      return this.streamGenerateGemini(prompt, system, temperature, maxTokens);
    }
    return this.streamGenerateDeepSeek(prompt, system, temperature, maxTokens);
  }

  private async streamGenerateDeepSeek(
    prompt: string,
    system?: string,
    temperature = 0.7,
    maxTokens = 200,
  ) {
    if (!this.deepseekApiKey) throw new Error('Falta DEEPSEEK_API_KEY');

    const body = {
      model: this.deepseekModel,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt },
      ],
      stream: true, // <— clave
      temperature,
      max_tokens: maxTokens, // limita longitud → menos tiempo
    };

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.deepseekApiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      const err = await res.text().catch(() => '');
      throw new Error(`DeepSeek stream error ${res.status}: ${err}`);
    }

    const out = new PassThrough();
    const reader: ReadableStreamDefaultReader<Uint8Array> = (
      res.body as any
    ).getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    (async () => {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // El stream viene como SSE: líneas "data: {...}"
        let idx: number;
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith('data:')) continue;

          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') {
            out.end();
            return;
          }

          try {
            const json = JSON.parse(payload);
            const delta = json?.choices?.[0]?.delta?.content ?? '';
            if (delta) out.write(delta);
          } catch {
            // ignora fragmentos incompletos
          }
        }
      }
      out.end();
    })().catch((e) => {
      out.emit('error', e);
      out.end();
    });

    return out; // Node stream con el texto
  }

  // Gemini: streamGenerateContent con alt=sse. Cada evento trae un trozo NUEVO de texto
  // (no acumulado), así que basta con reenviarlo tal cual llega.
  private async streamGenerateGemini(
    prompt: string,
    system?: string,
    temperature = 0.7,
    maxTokens = 200,
  ) {
    if (!this.geminiApiKey) throw new Error('Falta GEMINI_API_KEY');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:streamGenerateContent?alt=sse&key=${this.geminiApiKey}`;
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      const err = await res.text().catch(() => '');
      throw new Error(`Gemini stream error ${res.status}: ${err}`);
    }

    const out = new PassThrough();
    const reader: ReadableStreamDefaultReader<Uint8Array> = (
      res.body as any
    ).getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    (async () => {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith('data:')) continue;

          const payload = line.slice(5).trim();
          if (!payload) continue;

          try {
            const json = JSON.parse(payload);
            const delta =
              json?.candidates?.[0]?.content?.parts
                ?.map((p: any) => p.text)
                .join('') ?? '';
            if (delta) out.write(delta);
          } catch {
            // ignora fragmentos incompletos
          }
        }
      }
      out.end();
    })().catch((e) => {
      out.emit('error', e);
      out.end();
    });

    return out; // Node stream con el texto
  }
}
