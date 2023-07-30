import { ResourceKeeperError } from "./error";
import { ResourceRetention } from "./resource-retention";
import { Scheduler } from "./scheduler/scheduler";
import { defaultTimerScheduler } from "./scheduler/timer-scheduler";
import { AsyncDisposable, AsyncDispose } from "./type";

export class ResourceKeeper<T> implements AsyncDisposable {
  public static async create<T>(
    f: () => Promise<[T, AsyncDispose]>,
    scheduler: Scheduler = defaultTimerScheduler
  ): Promise<ResourceKeeper<T>> {
    const [resource, dispose] = await f();
    return new ResourceKeeper(scheduler, resource, dispose);
  }

  public retain(): ResourceRetention | null {
    if (this.isDisposed) {
      return null;
    }

    this.referenceCount++;
    return new ResourceRetention(() => this.referenceCount--);
  }

  public async dispose(): Promise<void> {
    if (0 < this.referenceCount || this._isDisposed) {
      return;
    } else {
      this._isDisposed = true;

      this.schedulerHandler!();
      this.schedulerHandler = null;

      this.registry!.unregister(this);
      this.registry = null;

      await this._dispose!();
      this._dispose = null;
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
    dispose: AsyncDispose
  ) {
    this.schedulerHandler = scheduler.register(() => this.dispose());
    this._dispose = dispose;

    this.registry = new FinalizationRegistry(() => dispose());
    this.registry.register(this, undefined);
  }

  private schedulerHandler: (() => unknown) | null;
  private _dispose: AsyncDispose | null;
  private registry: FinalizationRegistry<unknown> | null;

  private referenceCount = 0;
  private _isDisposed = false;
}
