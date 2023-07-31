/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResourceKeeperError } from "./error";
import { Scheduler } from "./scheduler/scheduler";
import { defaultTimerScheduler } from "./scheduler/timer-scheduler";
import { AsyncDisposable, AsyncDispose } from "./type";
import { finalize } from "./utility";

export class ResourceKeeper<T> implements AsyncDisposable {
  public static async create<T>(
    f: () => Promise<[T, AsyncDispose]>,
    scheduler: Scheduler = defaultTimerScheduler,
  ): Promise<ResourceKeeper<T>> {
    const [resource, dispose] = await f();
    return new ResourceKeeper(scheduler, resource, finalize(dispose));
  }

  public retain(): (() => void) | null {
    if (this.isDisposed) {
      return null;
    }

    this.referenceCount++;
    return finalize(() => this.referenceCount--);
  }

  public async dispose(): Promise<void> {
    if (0 === this.referenceCount && !this._isDisposed) {
      this._isDisposed = true;

      {
        const x = this.schedulerHandler!;
        (this as any).schedulerHandler = null;
        x();
      }

      (this as any)._resource = null;

      {
        const x = this._dispose!;
        (this as any)._dispose = null;
        await x();
      }
    }
  }

  public get isDisposed() {
    return this._isDisposed;
  }

  public get resource() {
    if (this.isDisposed) {
      throw new ResourceKeeperError("The resource was disposed.");
    }
    return this._resource;
  }

  private constructor(
    scheduler: Scheduler,
    private readonly _resource: T,
    private readonly _dispose: AsyncDispose,
  ) {
    this.schedulerHandler = scheduler.register(() => this.dispose());
  }

  private readonly schedulerHandler: () => unknown;

  private referenceCount = 0;
  private _isDisposed = false;
}
