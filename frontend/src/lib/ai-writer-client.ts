const ENDPOINT = "/api/ai/generate/stream";
const TIMEOUT_MS = 120_000;

export async function generateAiWriterText(
  prompt: string,
  system: string,
  temperature: number,
  maxTokens: number,
  onDelta?: (chunk: string) => void,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, system, temperature, maxTokens }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(err || `HTTP ${res.status}`);
  }

  if (!res.body || typeof res.body.getReader !== "function") {
    const full = await res.text();
    if (!full.trim()) throw new Error("Respuesta vacía.");
    return { text: full };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let acc = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    acc += chunk;
    onDelta?.(chunk);
  }

  if (!acc.trim()) throw new Error("Respuesta vacía.");
  return { text: acc };
}
