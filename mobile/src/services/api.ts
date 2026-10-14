import { Platform } from 'react-native';

const LOCAL_FALLBACK =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

// If devtunnel returns error or empty, fallback to local host direct bridge
const PRIMARY_URL = process.env.EXPO_PUBLIC_API_URL || LOCAL_FALLBACK;

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onCrisis: (text: string) => void;
  onError: (err: string) => void;
  onDone: () => void;
}

function doStreamRequest(
  url: string,
  message: string,
  userId: string,
  callbacks: StreamCallbacks,
  onFail?: () => void,
): { abort: () => void } {
  const xhr = new XMLHttpRequest();
  let seenBytes = 0;
  let isDone = false;

  const processIncomingText = (text: string) => {
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const rawData = trimmed.slice(6).trim();
        if (rawData === '[DONE]') {
          if (!isDone) {
            isDone = true;
            callbacks.onDone();
          }
          return;
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
  };

  xhr.open('POST', `${url}/consult/stream`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Accept', 'text/event-stream');
  xhr.setRequestHeader('X-Tunnel-Skip-Anti-Abuse', 'true');

  xhr.onprogress = () => {
    const rawResponse = xhr.responseText;
    if (rawResponse && rawResponse.length > seenBytes) {
      const newChunk = rawResponse.substring(seenBytes);
      seenBytes = rawResponse.length;
      processIncomingText(newChunk);
    }
  };

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      const rawResponse = xhr.responseText;
      if (rawResponse && rawResponse.length > seenBytes) {
        processIncomingText(rawResponse.substring(seenBytes));
      }
      if (!isDone) {
        isDone = true;
        callbacks.onDone();
      }
    } else {
      if (onFail) {
        onFail();
      } else {
        callbacks.onError(`Connection issue (HTTP ${xhr.status})`);
        if (!isDone) {
          isDone = true;
          callbacks.onDone();
        }
      }
    }
  };

  xhr.onerror = () => {
    if (onFail) {
      onFail();
    } else {
      callbacks.onError('Network connection failed. Ensure backend is running.');
      if (!isDone) {
        isDone = true;
        callbacks.onDone();
      }
    }
  };

  xhr.ontimeout = () => {
    if (onFail) {
      onFail();
    } else {
      callbacks.onError('Connection timed out.');
      if (!isDone) {
        isDone = true;
        callbacks.onDone();
      }
    }
  };

  try {
    xhr.send(JSON.stringify({ message, userId }));
  } catch (err: any) {
    if (onFail) {
      onFail();
    } else {
      callbacks.onError(err.message || 'Failed to send message.');
      callbacks.onDone();
    }
  }

  return { abort: () => xhr.abort() };
}

export async function streamCounselApi(
  message: string,
  userId: string,
  callbacks: StreamCallbacks,
): Promise<() => void> {
  // Try primary URL first (DevTunnel or configured). If that fails, auto-fallback to local direct emulator URL.
  let activeReq = doStreamRequest(PRIMARY_URL, message, userId, callbacks, () => {
    if (PRIMARY_URL !== LOCAL_FALLBACK) {
      // Automatic transparent fallback to direct localhost/10.0.2.2
      activeReq = doStreamRequest(LOCAL_FALLBACK, message, userId, callbacks);
    } else {
      callbacks.onError('Unable to connect to divine counsel. Ensure backend is active.');
      callbacks.onDone();
    }
  });

  return () => activeReq.abort();
}
