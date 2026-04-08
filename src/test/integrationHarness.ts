import { afterEach, beforeEach, vi } from "vitest";

/**
 * Nei `describe` d’integrazione HTTP: silenzia `console.log` del logger Express.
 */
export function useSilencedHttpLogs(): void {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
}
