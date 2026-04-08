/**
 * Mock globale `lib/supabase` per Vitest.
 * Implementazione nello stesso file della `vi.hoisted` (evita TDZ sugli import ESM).
 */
import { vi, beforeEach } from "vitest";

export type SupabaseQueryResult = { data: unknown; error: unknown };

interface SupabaseTestDoubleController {
  readonly client: { from: (table: string) => unknown };
  reset(): void;
  enqueue(...results: SupabaseQueryResult[]): void;
  setFallback(result: SupabaseQueryResult): void;
}

/** Function declaration: visibile a `vi.hoisted` nello stesso modulo. */
function createSupabaseTestDouble(): SupabaseTestDoubleController {
  const queue: SupabaseQueryResult[] = [];
  let fallback: SupabaseQueryResult = { data: [], error: null };

  function dequeue(): SupabaseQueryResult {
    return queue.shift() ?? fallback;
  }

  function createBuilder() {
    const b: Record<string, unknown> = {};
    const chain = () => b;
    b.select = chain;
    b.insert = chain;
    b.update = chain;
    b.delete = chain;
    b.eq = chain;
    b.order = chain;
    b.limit = chain;
    b.single = () => Promise.resolve(dequeue());
    b.maybeSingle = () => Promise.resolve(dequeue());
    b.then = (onFulfilled: (value: unknown) => unknown) =>
      Promise.resolve(dequeue()).then(onFulfilled);
    return b;
  }

  return {
    client: {
      from() {
        return createBuilder();
      },
    },
    reset() {
      queue.length = 0;
      fallback = { data: [], error: null };
    },
    enqueue(...results: SupabaseQueryResult[]) {
      queue.push(...results);
    },
    setFallback(result: SupabaseQueryResult) {
      fallback = result;
    },
  };
}

const td = vi.hoisted(() => createSupabaseTestDouble());

vi.mock("../lib/supabase", () => ({
  supabase: td.client,
}));

beforeEach(() => {
  td.reset();
});

export const mockDb = {
  reset: () => td.reset(),
  enqueue: (...results: SupabaseQueryResult[]) => td.enqueue(...results),
  setFallback: (result: SupabaseQueryResult) => td.setFallback(result),
};

export function dbOk(data: unknown): SupabaseQueryResult {
  return { data, error: null };
}

export function dbErr(message: string): SupabaseQueryResult {
  return { data: null, error: { message } };
}

export function dbList<T>(rows: T[]): SupabaseQueryResult {
  return { data: rows, error: null };
}
