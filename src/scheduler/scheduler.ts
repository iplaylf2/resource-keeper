import { AsyncDisposable } from "../type";

export interface Scheduler extends AsyncDisposable {
  register(dispose: () => unknown): () => unknown;
}
