export class WAY_WinInfo {
    public symbolId: number;
    public hitDirection: string;
    public hitNumber: number;
    public hitCount: number;
    public hitOdds: number;
    public symbolWin: number;
    public symbols: any[];
    public position: number[];
    public hitSymbol: number;
    /**判斷是否為win symbol */
    public screenHitData: boolean[][];
}
