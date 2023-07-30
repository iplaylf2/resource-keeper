import { ResourceKeeperError } from "../error";
import { Dispose } from "../type";
import { Scheduler } from "./scheduler";

export class TimerScheduler implements Scheduler {
  public constructor(span: number) {
    this.timer = setInterval(() => this.allSettled(), span);
  }

  public register(dispose: Dispose): () => unknown {
    if (this.isDisposed) {
      throw new ResourceKeeperError("The scheduler was disposed.");
    }

    this.set.add(dispose);
    return () => this.set.delete(dispose);
  }

  public async dispose() {
    if (!this._isDisposed) {
      this._isDisposed = true;
      clearInterval(this.timer);

      await this.allSettled();
      this.set.clear();
    }
  }

  public get isDisposed() {
    return this._isDisposed;
  }

  private allSettled() {
    return Promise.allSettled(Array.from(this.set).map((dispose) => dispose()));
  }

  private readonly set = new Set<Dispose>();
  private readonly timer: ReturnType<typeof setInterval>;
  private _isDisposed = false;
}

export const defaultTimerScheduler = new TimerScheduler(60_000);
