import { createActorWithConfig } from "../config";
import type { backendInterface } from "../backend";

let _backend: backendInterface | null = null;
let _promise: Promise<backendInterface> | null = null;

async function getBackend(): Promise<backendInterface> {
  if (_backend) return _backend;
  if (_promise) return _promise;
  _promise = createActorWithConfig().then((actor) => {
    _backend = actor;
    return actor;
  });
  return _promise;
}

// Proxy that lazily initializes the backend and forwards all calls
export const backend = new Proxy({} as backendInterface, {
  get(_target, prop: string) {
    return async (...args: unknown[]) => {
      const actor = await getBackend();
      const fn = (actor as unknown as Record<string, (...a: unknown[]) => unknown>)[prop];
      if (typeof fn !== "function") throw new Error(`backend.${prop} is not a function`);
      return fn.call(actor, ...args);
    };
  },
});
