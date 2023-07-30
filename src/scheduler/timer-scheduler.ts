import { Dispose } from "../type";
import { Scheduler } from "./scheduler";

export class TimerScheduler implements Scheduler {
  public constructor(span: number) {
    this.timer = setInterval(() => this.allSettled(), span);
  }

  public register(dispose: Dispose): () => unknown {
    this.set.add(dispose);
    return () => this.set.delete(dispose);
  }

  public async dispose() {
    if (!this._dispose) {
      this._dispose = true;
      clearInterval(this.timer);

      await this.allSettled();
    }
  }

  private allSettled() {
    return Promise.allSettled(Array.from(this.set).map((dispose) => dispose()));
  }

  private readonly set = new Set<Dispose>();
  private _dispose = false;
  private readonly timer: ReturnType<typeof setInterval>;
}

export const defaultTimerScheduler = new TimerScheduler(60_000);
