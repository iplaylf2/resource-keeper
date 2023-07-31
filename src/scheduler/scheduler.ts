import { AsyncDisposable, AsyncDispose, Dispose } from "../type";

export interface Scheduler extends AsyncDisposable {
  register(dispose: AsyncDispose): Dispose;
}
