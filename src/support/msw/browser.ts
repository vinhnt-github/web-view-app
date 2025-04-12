import { setupWorker } from "msw/browser";

export function createWorker() {
  return setupWorker();
}
