export class RecoveryData {
    constructor() {
        this.gameSceneName = 'Game_1';
        this.gameStateId = 1;
        this.symbolClickedList = [];
    }

    /**
     * Game Scene Data
     */
    gameSceneName: string;

    /**
     * 回傳遊戲狀態Id。0:Initial，1~gameStateCount:各遊戲狀態，(gameStateCount+1):BoardEnd
     */
    gameStateId: number;

    /**
     * 回傳剩餘場次
     */
    lastRounds: number;

    /**
     * Mini Game點選紀錄
     */
    symbolClickedList: number[];
}
