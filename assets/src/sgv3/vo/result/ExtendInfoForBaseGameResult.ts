export class ExtendInfoForBaseGameResult {
    public isPowerUp: boolean;
    public ballCount: number;
    public ballTotalCredit: number;
    public ballScreenLabel: Array<Array<number>>;
    public mysterySymbol: number;
    public extendPlayerWin: number;
    public extendGameFeature: number;
    // rngInfo 備份，避免 Recovery 後，rngInfo 資料遺失的問題
    public backUpRngInfo: Array<Array<number>>;
    public featureIdx: number; // 紀錄每個Round中，group使用哪一個組合s
    public seatInfo: SeatInfo;
}

export class SeatInfo {
    public statusType: number;
    public statusCount: number;
    public statusAccumulation: Array<number>; // 紀錄該座位狀態機的累積程度
    public screenRngInfo: Array<Array<number>>; // 用以恢復該座位的盤面顯示
    public usedTableIndex: number; // 紀錄該座位使用的TableIndex
    public miniGameWaterLevel: number; // 紀錄該座位的彩金狀態機水位
    public denomMultiplier: number; // 紀錄該座位的Denom倍數
    public featureIdx: number;
}
