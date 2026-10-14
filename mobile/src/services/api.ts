const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onCrisis: (text: string) => void;
  onError: (err: string) => void;
  onDone: () => void;
}

export async function streamCounselApi(
  message: string,
  userId: string,
  callbacks: StreamCallbacks,
): Promise<() => void> {
  const controller = new AbortController();

  try {
    const response = await fetch(`${BACKEND_URL}/consult/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, userId }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is empty');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;

      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.slice(6).trim();
            if (rawData === '[DONE]') {
              callbacks.onDone();
              return () => controller.abort();
            }

            try {
              const parsed = JSON.parse(rawData);
              if (parsed.crisis) {
                callbacks.onCrisis(parsed.text);
              } else if (parsed.text) {
                callbacks.onChunk(parsed.text);
              } else if (parsed.error) {
                callbacks.onError(parsed.error);
              }
            } catch {
              // Ignore partial JSON lines
            }
          }
        }
      }
    }

    callbacks.onDone();
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      callbacks.onError(err.message || 'Connection to counsel stream failed.');
    }
  }

  return () => controller.abort();
}
