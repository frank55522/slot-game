export class WAY_WinResult {
    /** 回傳中獎圖示Id */
    symbolID: number;
    /** 回傳贏分組合方向 */
    hitDirection: string;
    /** 回傳中獎滾輪數 */
    hitNumber: number;
    /** 回傳堆疊數 */
    count: number;
    /** 回傳中獎倍數 */
    hitOdds: number;
    /** 回傳贏分 */
    symbolWin: number;
    /** 回傳中獎畫面 */
    screenHitData: Array<Array<boolean>>;
}
