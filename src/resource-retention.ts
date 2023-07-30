export class ResourceRetention {
  public constructor(handler: () => unknown) {
    this._handler = handler;
  }

  public unretain() {
    if (this.isRetained) {
      this._isRetained = false;
      this._handler!();
      this._handler = null;
    }
  }

  public get isRetained(): boolean {
    return this._isRetained;
  }

  private _isRetained = true;
  private _handler: (() => unknown) | null;
}
