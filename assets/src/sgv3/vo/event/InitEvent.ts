import { SeatInfo } from '../result/ExtendInfoForBaseGameResult';
import { SpinResult } from '../result/SpinResult';
import { ExecuteSetting } from '../setting/ExecuteSetting';
import { GameStateSetting } from '../setting/GameStateSetting';

/**
 * 封裝初始化資料
 *
 * @export
 * @class InitEvent
 */
export class InitEvent {
    // executeSetting: ExecuteSetting;

    /**
     * auto play times list
     */
    public autoPlayTimesList: Array<number>;

    /**
     * available denoms
     */
    public denoms: Array<number>;

    /**
     * max time of gambles allowed
     */
    public gambleTimes: number;

    /**
     * max gambling amount (in CENT)
     */
    public gambleLimit: number;

    /**
     * index of default denom, regarding the "denoms" array
     */
    public defaultDenomIdx: number;

    /**
     * index of default bet line selection
     */
    public defaultBetLineIdx: number;

    /**
     * index of default line bet selection
     */
    public defaultLineBetIdx: number;

    /**
     * index of default ways bet column selection
     */
    public defaultWaysBetColumnIdx: number;

    /**
     * index of default ways bet selection
     */
    public defaultWaysBetIdx: number;

    /**
     * all possible bet combination for this user in this game
     * (key: bet_betSubject_extraBetType, ex: "1_50_NoExtraBet": 30)
     */
    public betCombinations: { [key: string]: number };
    public singleBetCombinations: { [key: string]: number };

    /** 紀錄可執行的遊戲設定 */
    public executeSetting: ExecuteSetting;

    /** game feature count */
    public gameFeatureCount: number;

    /** 最大押分 */
    public maxBet: number;

    // For Reconstruct GameStateSetting
    public gameStateSettings: Array<GameStateSetting>;

    /** Recovery紀錄 表演內容 */
    public recoveryData: string;
    public recoveryBalance: number;

    /** 沒有完成 SettlePlay前，會有的資料  */
    public spinResult: SpinResult;
    public gameSeqNo: number;

    /** 意象物累積初始資料 */
    public initialData: InitialData;

    /** 
     * @summary 押注組合的基礎押注倍數 
     * @description TotalBet(Credit) = baseBet * betMultiplier
     */
    public betMultiplier: Array<number>;

    /**
     * @summary 押注組合對應的 denom 倍數設定
     * @description 有此資料時，遊戲的押注選單會顯示 denom 倍數選項，
     * 且 Jackpot bonus 會依照玩家選擇 denom 倍數來計算
     */
    public denomMultiplier: Array<number>;

    /**
     * @summary 押注組合的特色押注
     */
    public featureBetList: Array<number>;
}

export class InitialData {
    public seatStatusCache: seatStatusCache;
}

export class seatStatusCache {
    public seatInfo: SeatInfo;
    public mysterySymbol: number;
    public ballScreenLabel: Array<Array<number>>;
}
