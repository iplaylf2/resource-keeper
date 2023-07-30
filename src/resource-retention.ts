export class ResourceRetention {
  public constructor(handler: () => unknown) {
    this._handler = handler;

    this.registry = new FinalizationRegistry(() => handler());
    this.registry.register(this, undefined);
  }

  public unretain() {
    if (this.isRetained) {
      this._isRetained = false;

      this.registry!.unregister(this);
      this.registry = null;

      this._handler!();
      this._handler = null;
    }
  }

  public get isRetained(): boolean {
    return this._isRetained;
  }

  private _handler: (() => unknown) | null;
  private registry: FinalizationRegistry<unknown> | null;
  private _isRetained = true;
}
