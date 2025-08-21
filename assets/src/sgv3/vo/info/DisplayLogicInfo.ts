export class DisplayLogicInfo {
    maxTriggerCountFlag: boolean; // 是否達到最大Trigger
    beforeAccumulateWinWithoutBaseGameWin: number; //紀錄該把freeGame累積前的累積贏分。( 不包含BaseGameWin)
    afterAccumulateWinWithoutBaseGameWin: number; //紀錄該把freeGame累積後的累積贏分。( 不包含BaseGameWin)
    beforeAccumulateWinWithBaseGameWin: number; //紀錄該把freeGame累積前的累積贏分。( 包含BaseGameWin)
    afterAccumulateWinWithBaseGameWin: number; //紀錄該把freeGame累積後的累積贏分。( 包含BaseGameWin)
}
