/**
 * Where the HTTP server listens. Without LISTEN_HOST it listens on every interface, which containers
 * (production) need; the shared staging host sets LISTEN_HOST=127.0.0.1 so only its proxy can reach it.
 */
export function listenAddress(config: { PORT: number; LISTEN_HOST?: string }) {
  return { port: config.PORT, hostname: config.LISTEN_HOST };
}
