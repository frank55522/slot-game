export class SymbolMatchInfo {
    public constructor() {
        this.resetInfo();
    }

    private _onError: boolean;
    public get onError(): boolean {
        return this._onError;
    }
    public set onError(v: boolean) {
        this._onError = v;
    }

    private _reelSymbolFrames: number[][];
    public get reelSymbolFrames(): number[][] {
        return this._reelSymbolFrames;
    }
    public set reelSymbolFrames(v: number[][]) {
        this._reelSymbolFrames = v;
    }

    public resetInfo(): void {
        this.reelSymbolFrames = [];
        this.onError = false;
    }
}
