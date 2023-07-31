import { Dispose } from "./type";

export function finalize(
  dispose: (() => void) | (() => Promise<void>),
): () => Promise<void> {
  const token = {};

  let isDisposed = false;
  const _dispose = async () => {
    if (!isDisposed) {
      isDisposed = true;

      heldFinalizer.unregister(token);

      const x = dispose;
      dispose = null as never;
      await x();
    }
  };

  heldFinalizer.register(_dispose, dispose, token);

  return _dispose;
}

const heldFinalizer = new FinalizationRegistry((held: Dispose) => held());
