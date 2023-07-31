import { ResourceKeeperError } from "../error";
import { AsyncDispose, Dispose } from "../type";
import { finalize } from "../utility";
import { Scheduler } from "./scheduler";

export class TimerScheduler implements Scheduler {
  public constructor(span: number) {
    this.timer = setInterval(() => allSettled(Array.from(this.set)), span);
  }

  public register(dispose: AsyncDispose): Dispose {
    if (this.isDisposed) {
      throw new ResourceKeeperError("The scheduler was disposed.");
    }

    this.set.add(dispose);
    return finalize(() => this.set.delete(dispose));
  }

  public async dispose() {
    if (!this._isDisposed) {
      this._isDisposed = true;
      clearInterval(this.timer);

      const disposeArray = Array.from(this.set);
      this.set.clear();

      await allSettled(disposeArray);
    }
  }

  public get isDisposed() {
    return this._isDisposed;
  }

  private readonly set = new Set<AsyncDispose>();
  private readonly timer: ReturnType<typeof setInterval>;
  private _isDisposed = false;
}

export const defaultTimerScheduler = new TimerScheduler(60_000);

function allSettled(disposeArray: Array<AsyncDispose>) {
  return Promise.allSettled(
    disposeArray.map(async (dispose) => await dispose()),
  );
}
