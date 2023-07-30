export type Dispose = () => unknown;

export type AsyncDispose = () => Promise<unknown>;

export interface Disposable {
  dispose: Dispose;
}

export interface AsyncDisposable {
  dispose: AsyncDispose;
}
