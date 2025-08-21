import { CoreGameData } from '../../../core/vo/CoreGameData';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { AllWinData } from '../data/AllWinData';
import { GameScene } from '../data/GameScene';
import { GameHitPattern } from '../enum/GameHitPattern';
import { GameModule } from '../enum/GameModule';
import { WinBoardState } from '../enum/WinBoardState';
import { JackpotEvent } from '../event/JackpotEvent';
import { SpinResult } from '../result/SpinResult';
import { InitEvent } from '../event/InitEvent';
import { GameStateResult } from '../result/GameStateResult';
import { CommonGameResult } from '../result/CommonGameResult';
import { RecoveryData } from '../data/RecoveryData';
import { WinType } from '../enum/WinType';
import { SpeedMode } from '../../../game/vo/enum/Game_UIEnums';

export class GameData extends CoreGameData {
    /** 取得 init 設定資料 */
    public initEventData: InitEvent = null;
    /** 取得 spin 設定資料 */
    public spinEventData: SpinResult = null;
    /** 取得 Spin 序號 */
    public spinSequenceNumber: number = NaN;
    /** 當前數學遊戲狀態資料 */
    public curStateResult: GameStateResult = null;
    /** 當前回合表演資料 */
    public curRoundResult: CommonGameResult = null;
    /** 預設贏分模式 */
    public initHitPattern: GameHitPattern = null;
    /** 觸發 Jackpot */
    public onHitJackpot: boolean = false;
    /** 是否可以更新 Jackpot Pool */
    public canUpdateJackpotPool: boolean = true;
    /** 拉中 Jackpot 為 Grand or Major */
    public hitJackpotPoolTypes: number[] = [];
    /** Jackpot 資料 */
    public jackpotData: JackpotEvent[] = [];
    /** 彩金 */
    public credit: number = NaN;
    /** 總贏得彩金 */
    public playerTotalWin: number = NaN;
    /** 滾分結束 */
    public rollingMoneyEnd: boolean = false;
    /** 贏分組合表演一次 */
    public showWinOnceComplete: boolean = false;
    /** 是否為自動模式 */
    public onAutoPlay: boolean = false;
    /** 自動模式 - 目前次數 */
    public curAutoTimes: number = 0;
    /** 自動模式 - 最大次數 */
    public maxAutoTimes: number = 0;
    /** BaseGame的TurboMode狀態 */
    public curTurboMode: boolean = false;
    /** BaseGame的TurboMode狀態*/
    public isShowTurboModeMsg: boolean = false;
    /** 玩家選擇的遊戲狀態Operation */
    public curGameOperation: string = '';
    /** 滾分中 */
    public scrollingWinLabel: boolean = false;
    /** 是否可以觸發滾分急停了 */
    public scrollingWinLabelCanSkip: boolean = false;
    /** ScrollingEnd是否播放了 */
    public scrollingEndPlayed: boolean = false;
    /** 投注組合列表 */
    public totalBetList: number[] = [];
    /** Jackpot投注所有列表 */
    public jackpotAllBetList: number[] = [];
    /** 投注組合index */
    public totalBetIdx: number = 0;
    /** 選擇哪個feature */
    public featureMode: number = -1;
    /** 遊戲屬於哪種BetType */
    public gameModule: GameModule = GameModule.None;
    /** 延遲播放大獎音 Index */
    public winBoardSoundDelayIndex: number = 0;
    /**分級贏分面板狀態 */
    public winBoardState: WinBoardState = WinBoardState.HIDE;
    /** 遊戲狀態 */
    public gameState: string = StateMachineProxy.LOADING;
    /** 目前場景 */
    public curScene: string = GameScene.Init;
    /** 上一組場景 */
    public preScene: string = GameScene.Init;
    /** 是否為game2結束 */
    public afterFeatureGame: boolean = false;
    /** 當前贏分資料 */
    public curWindData: AllWinData;
    /**FG=>BG當前贏分 */
    public totalWinAmount: number;
    /**FG=>BG滾分時間*/
    public totalScoringTime: number;
    /**FG=>BG獎項類別*/
    public totalWinType: WinType;
    /**聲音開關狀態 */
    public soundEnableState: boolean = true;
    /** 狀態贏分資料 */
    public stateWinData: AllWinData;
    /** 投注 */
    public curBet: number = NaN;
    /** 當前totalBet */
    public curTotalBet: number = NaN;
    /** 當前totalBet */
    public curExtraBet: string;
    /** 是否可以spin */
    public readySpin: boolean = false;
    /** 是否spin中 */
    public isSpinning: boolean = false;
    /** 是否IdleReminded */
    public isIdleReminding: boolean = false;
    /** 最大押分的列表長度 */
    public maxTotalBetLength: number = Number.MAX_VALUE;
    /** 是否為報表模式 */
    public isReportMode: boolean = false;
    /** Recovery狀態資料 */
    public recoveryState: RecoveryData;
    /** 是否為 Free Play */
    public onFreePlay: boolean = false;
    /** 是否有收到 Feature selection 的結果 */
    public hasSelectionResponse: boolean = false;
    /** 是否正在載入或開啟 Help view */
    public isLoadingHelp: boolean = false;
    /** 當前遊戲速度 */
    public curSpeedMode: string = SpeedMode.STATUS_NORMAL;
    /** 是否準備進入 Mini game */
    public isReadyEnterMiniGame: boolean = false;
}
