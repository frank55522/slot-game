export class WheelData {
    /** 代表輪帶長度 */
    public wheelLength: number;
    /** 紀錄不中獎的位置。如果是相依轉輪只有一個，若為獨立轉輪則看screenRow數量 */
    public noWinIndex: number[];
    /** 紀錄輪帶資料 */
    public wheelData: number[];
}
