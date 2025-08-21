import { Prefab } from "cc";

export class GameSceneData {
    /** Scene 對應數學遊戲類別id */
    gameStateIds: number[];
    /** Reel Symbol Mapping Table, Key為該資料的使用場景(enum GameScene) */
    reelSymbolFrameByIDs: number[];
    /** Reel 滾停序列 */
    reelSpinStopSequence: Array<number[]>;
    /** 有動畫的 IDs */
    animationIDs: number[];
    /** symbol 寬 */
    symbolWidth: number;
    /** symbol 高 */
    symbolHeight: number;
    /** free speical symbol ID */
    freeScatterID: number;
    /** bonus speical symbol ID */
    bonusScatterID: number;
    /** wild speical symbol ID */
    wildScatterID: number;
    /** beforeWin 播放動畫時間 */
    beforeWinRunningTime: number;
    /** speical hit 播放動畫時間 */
    specialHitRunningTime: number;
    /** miniGame hit 播放動畫時間 */
    miniGameHitRunningTime: number;
    /** 贏得場次面板播放時間 */
    wonSpinBoardRunningTime: number;
    /** 再次觸發 speical 面板播放時間 */
    retriggerBoardRunningTime: number;
    /** 贏分面板播放時間 */
    wonCreditBoardRunningTime: number;
    /** 贏分面板關閉時間 */
    wonCreditBoardEndTime: number;
    /** 無贏分面板播放時間 */
    completeBoardRunningTime: number;
    /** 面板結束 淡出轉場時間 */
    completeFadeOutSceneTime: number;
    /** 單局無贏分頓點停留時間 */
    noWinStayTime: number;

    /** Bonus PlayBGM After Enter Scene */
    bonusGamePlayBGMAfterEnterTime: number;
    /** Bonus Game 顯示獲得Symbol表演時間 */
    bonusGameWinSymbolShowTime: number;
    /** Bonus Game 點選Symbol表演時間 */
    bonusGameClickSymbolShowTime: number;
    /** Bonus Game 表演總分後隔多久灑金幣 */
    bonusCoinFallAfterCreditBoardTime: number;
    /** Bonus Game 灑金幣後隔多久關閉場景 */
    bonusCloseViewAfterCoinFallTime: number;
    /** Bonus Game 表演幾秒可以觸發Skip滾分 */
    bonusCanSkipRunCreditsTime: number;

    /** Feature Selection 淡入時間 */
    featureSelectionShowTime: number;
    /** reel prefab */
    reelPrefab: Prefab;
}

export class ShakeInfo {
    repeat: number;
    range: number;
    frequency: number;
}
