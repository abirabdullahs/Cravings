type DebugContext = Record<string, unknown>;



export function debugLog(event: string, context: DebugContext = {}) {
  if (process.env.DEBUG_LOGS !== "true") return;

  console.info(`[debug] ${event}`, {
    timestamp: new Date().toISOString(),
    ...context,
  });
}

