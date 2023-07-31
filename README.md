# resource-keeper

A tool for automatically managing and stably recycling unmanaged resources.

## Usage

```typescript
import { ResourceKeeper } from "resource-keeper";

(async () => {
  const foo = await ResourceKeeper.create(async () => {
    const foo = { count: 0 };

    const timer = setInterval(() => foo.count++, 100);

    return [foo, async () => clearInterval(timer)];
  });

  const unretain = foo.retain();
  setInterval(() => {
    if (foo.isDisposed) {
      console.log("disposed");
    } else {
      console.log(foo.resource.count);
    }
  }, 100);
})();
```
