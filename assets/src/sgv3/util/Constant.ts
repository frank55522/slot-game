/**
 * 畫面轉場事件
 * @author luke
 */
export class SceneEvent {
    public static LOAD_BASE_COMPLETE: string = 'loadBaseComplete';
    public static BATCH_LOADING_COMPLETE: string = 'batchLoadingComplete';
    public static PENDING_EVENT_AND_SHOW_LOADING: string = 'pendingEventAndShowLoading';
    public static LOAD_USER_INFO_COMPLETE: string = 'loadUserInfoComplete';
    public static LOAD_UI_VERSION_COMPLETE: string = 'loadUIVersionComplete';
    public static LOAD_GAME_DATA_COMPLETE: string = 'loadGameDataComplete';
    public static LOAD_LOGO_URL: string = 'loadLogoUrl';
    public static LOAD_PROVIDER_URL: string = 'loadProviderUrl';
    public static LOAD_SPIN_LOGO_URL: string = 'loadSpinLogoUrl';
}

export class GameStateProxyEvent {
    public static ON_SCENE_BEFORE_CHANGE: string = 'onSceneBeforeChange';
    public static ON_SCENE_CHANGED: string = 'onSceneChanged';
    public static ON_WIN_STATE_CHANGED: string = 'onWinStateChanged';
}

export class WinEvent {
    public static ON_HIT_SPECIAL: string = 'specialHit';
    public static ON_HIT_GRAND: string = 'hitGrand';
    /** 強迫贏分表現消失 */
    public static FORCE_WIN_DISPOSE: string = 'forceWinDispose';
    public static FORCE_UPDATE_WIN_LABEL: string = 'forceUpdateWinLabel';
    public static FORCE_WIN_LABEL_COMPLETE: string = 'forceWinLabelComplete';
    /** 贏分組合表演完畢 */
    public static SHOW_WIN_ASSEMBLE_COMPLETE: string = 'showWinAssembleComplete';
    public static RUN_WIN_LABEL_START: string = 'runWinLabelStart';
    public static MULTIPLE_SET: string = 'multipleSet';
    public static SCORING_RUNNING_TIME_SET: string = 'scoringRunningTimeSet';
    public static RUN_WIN_LABEL_COMPLETE: string = 'runWinLabelComplete';
    public static RUN_WIN_SCROLLING_SOUND_START: string = 'runWinScrollingSoundStart';
    public static RUN_WIN_SCROLLING_SOUND_COMPLETE: string = 'runWinScrollingSoundComplete';
    public static ON_HIT_WIN_BOARD: string = 'onHitWinBoard';
    public static ON_HIT_JACKPOT_WIN: string = 'onHitJackpot';
    public static HIDE_BOARD_REQUEST: string = 'hideBoardRequest';
    public static SHOW_LINES_COMPLETE: string = 'showAllLinesComplete';
    public static SHOW_WIN_BOARD: string = 'showWinBoard';
    public static REEL_WIN_PLAYING: string = 'reelWinPlaying';
}

export class StateWinEvent {
    public static readonly ON_GAME1_TRANSITIONS: string = 'onGame1Transitions';
    /** Game2 轉場動畫 */
    public static readonly ON_GAME2_TRANSITIONS: string = 'onGame2Transitions';
    /** Game2 開場動畫 */
    public static readonly ON_GAME2_OPENING: string = 'onGame2Opening';
    /** Game2 最後顯示滾分面板 */
    public static readonly SHOW_LAST_CREDIT_BOARD: string = 'showLastCreditBoard';
    /** Game2 最後顯示遊戲結束面板 */
    public static readonly SHOW_LAST_WIN_COMPLETE: string = 'showLastWinComplete';
    /** Game2 Retrigger */
    public static readonly ON_GAME2_SHOW_TOOLTIP: string = 'onGame2ShowTooltip';
    /** Game2 離開場景動畫 */
    public static readonly ON_GAME2_EXITING: string = 'onGame2Exiting';

    public static readonly ON_GAME3_TRANSITIONS: string = 'onGame3Transitions';
    public static readonly ON_GAME3_SHOW_INFO: string = 'onGame3ShowInfo';
    public static readonly ON_GAME3_SHOW_SELECTION: string = 'onGame3ShowSelection';
    public static readonly ON_GAME3_RECOVERY: string = 'onGame3Recovery';
    public static readonly ON_BTN_STATE_CHANGED: string = 'onBtnStateChanged';

    public static readonly ON_GAME4_TRANSITIONS: string = 'onGame4Transitions';

    public static readonly ON_GAME4_OPENING: string = 'onGame4Opening';
}

export class BalanceProxyEvent {
    public static ON_BALANCE_LACK: string = 'onBalanceLack';
}

export class ReelEvent {
    public static ON_REELS_INIT: string = 'onReelsInit';
    public static ON_REELS_RESTORE: string = 'onReelsRestore';
    public static ON_REELS_START_ROLL: string = 'onReelsStartRoll';
    public static ON_REELS_PERFORM_END: string = 'onReelsPerformEnd';
    public static ON_REELS_EMERGENCY_STOP: string = 'onReelsEmergencyStop';

    public static ON_SINGLE_REEL_START_STOP: string = 'onSingleReelStartStop';
    public static ON_SINGLE_REEL_STOP_END: string = 'onSingleReelStopEnd';
    public static ON_SINGLE_REEL_START_DAMPING: string = 'onSingleReelStartDamping';
    public static ON_SINGLE_REEL_STOP_ERROR: string = 'onSingleReelStopError';

    public static ON_QUICK_STATE_CHANGE: string = 'onQuickStateChange';

    public static SHOW_ALL_REELS_WIN: string = 'showAllReelsWin';
    public static SHOW_REELS_WIN: string = 'showReelsWin';
    public static SHOW_HOLD_SPIN_WIN: string = 'showHoldSpinWin';
    public static SHOW_REELS_LOOP_WIN: string = 'showReelsLoopWin';
    public static HIDE_WILD_SYMBOL: string = 'hideWildSymbol';
    public static SHOW_LAST_SYMBOL_OF_REELS: string = 'showLastSymbolOfReels';

    public static ON_REEL_PRIZE_PREDICTION: string = 'onReelPrizePrediction';
    public static ON_REEL_EFFECT_COMPLETE: string = 'onReelEffectComplete';
    public static ON_REELS_RESET: string = 'onReelsReset';

    public static ON_HIDE_C1_AND_C2: string = 'onHideC1AndC2';
}

export class SpinResultProxyEvent {
    public static RESPONSE_SPIN: string = 'responeSpin';
    public static CMD_PARSE_STATE_WIN_RESULT: string = 'cmdParseStateWinResult';
    public static CMD_PARSE_ROUND_WIN_RESULT: string = 'cmdParseRoundWinResult';
}

export class ReelDataProxyEvent {
    public static ON_STRIP_CHANGE: string = 'onStripChange';
}

export class AutoPlayEvent {
    public static ON_TIMES_CHANGE: string = 'onTimesChange';
}

export class ScreenEvent {
    public static ON_SPIN_DOWN: string = 'onSpinDown';
    public static ON_MINUS_BET: string = 'onMinusBet';
    public static ON_PLUS_BET: string = 'onPlusBet';
    public static ON_BET_CHANGE: string = 'onBetChange';
}

export class UnitTestEvent {
    public static SET_RNG: string = 'setRng';
}

export class SoundEvent {
    public static readonly BUTTON_DOWN_SOUND = 'Button_UI';
    public static readonly SPIN_DOWN_SOUND = 'Button_Spin';
}

export class BaseSoundParms {
    public static readonly WEBBTN = 'webBtn';
    public static readonly GAME1 = 'game1';
    public static readonly GAMEIDLE = 'game1Idle';
    public static readonly GAME2 = 'game2';
    public static readonly GAME2END = 'game2End';
    public static readonly BGM = 'bgm';
    public static readonly SE = 'se';
    public static readonly GAME3 = 'game3';
    public static readonly Game3END = 'game3End';
}

export class ViewMediatorEvent {
    public static readonly ENTER = 'viewMediatorEnter';
    public static readonly LEAVE = 'viewMediatorLeave';
    /** 顯示 贏分表演動畫物件*/
    public static readonly SHOW_ANIM_SYMBOL = 'showAnimSymbol';
    /** 顯示 贏分表演 */
    public static readonly SHOW_WIN_LINE_DATA = 'showWinLineData';
    /** 發出通知得到多少場免費遊戲 */
    public static readonly SHOW_WON_SPIN_DATA = 'showWonSpinData';
    /** 顯示FreeSpin UI*/
    public static readonly SHOW_FREE_SPIN_MSG = 'showFreeSpinMsg';
    /** 關閉FreeSpin相關 UI */
    public static readonly CLOSE_FREE_SPIN_MSG = 'closeFreeSpinMsg';
    /** 更新FreeSpin 數值 */
    public static readonly UPDATE_FREE_SPIN_MSG = 'updateFreeSpinMsg';

    /** Game2 隱藏所有Board，包含贏得場次、再次贏得場次、game2贏分、game2完成 */
    public static readonly HIDE_ALL_BOARD = 'hideAllBoard';
    /** Game2 Retrigger */
    public static readonly SHOW_RETRIGGER_BOARD: string = 'showRetriggerBoard';
    /** 切換物件容器 */
    public static readonly CHANGE_DISPLAY_CONTAINER: string = 'changeDisplayContainer';

    public static readonly FORTUNE_LEVEL_CHANGE: string = 'fortuneLevelChange';

    public static readonly JACKPOT_WON_SHOW: string = 'jackpotWonShow';
    public static readonly JACKPOT_WON_CLOSE: string = 'jackpotWonClose';
    /** 顯示 Feature selection */
    public static readonly SHOW_FEATURE_SELECTION: string = 'showFeatureSelection';

    /** 練習2: 收集分數球前的表演 */
    public static readonly BEFORE_COLLECT_BALL: string = 'beforeCollectBall';
    public static readonly PREPARE_COLLECT_BALL: string = 'prepareCollectBall';
    public static readonly ON_CREDIT_BALL_COLLECT_START: string = 'onCreditBallCollectStart';
    public static readonly COLLECT_CREDIT_BALL: string = 'collectCreditBall';
    public static readonly COLLECT_CREDIT_BALL_SKIP_CALLBACK: string = 'collectCreditBallSkipCallback';

    public static readonly RECOVERY_LOAD_VIEW: string = 'recoveryLoadView';
    public static readonly INIT_EMBLEM_LEVEL: string = 'initEmblemLevel';
    public static readonly UPDATE_EMBLEM_LEVEL: string = 'updateEmblemLevel';
}

export class WebGameState {
    public static INIT: string = 'init';
    public static SPIN: string = 'spin';
    public static ROLLCOMPLETE: string = 'rollComplete';
    public static WINBOARD_HIT: string = 'onHitWinBoard';
    public static WINBOARD_HIDE: string = 'onHideWinBoard';
    public static JACKPOT_HIDE: string = 'onHideJackpot';
}

export class JackpotPool {
    public static POOL_VALUE_UPDATE: string = 'poolValueUpdate';
    public static MINIGAME_WINBOARD: string = 'MiniGameShowWinboard';
    public static CHANGE_SCENE: string = 'changeScene';
    public static EXIT_SCENE: string = 'exitScene';
    public static HIGHLIGHT_HIT_POOL: string = 'highlightHitPool';
    public static HIDE_HIGHLIGHT: string = 'hideHighlight';
    public static HIT_JACKPOT_TO_POOL_VALUE_INIT: string = 'hitJackpotToPoolValueInit';
    public static HIT_JACKPOT_TO_POOL_VALUE_UPDATE: string = 'hitJackpotToPoolValueUpdate';
    public static GRAND: number = 1;
    public static MAJOR: number = 2;
    public static MINOR: number = 3;
    public static MINI: number = 4;
}

export class CtrlPanelBtnState {
    public static DISABLED: number = 0;
    public static CAN_CLICK: number = 1;
    public static CREATE_BET_MENU: string = 'createBetMenu';
    public static UPDATE_BET_MENU: string = 'updateBetMenu';
    public static CREATE_BONUS_UPGRADE_BET_RANGE_INFO: string = 'createBonusUpgradeBetRangeInfo';
}

export class DragonUpEvent {
    /** Retrigger 加場次 事件 */
    public static ON_RESPIN_NEXT_START: string = 'onRespinNextStart';
    public static ON_RESPIN_NEXT_END: string = 'onRespinNextEnd';

    public static ON_C2_COUNT_UPDATE: string = 'onC2CountUpdate';
    /** 全部金球的起始與結束 事件 */
    public static ON_ALL_CREDIT_COLLECT_START: string = 'onAllCreditCollectStart';
    public static ON_ALL_CREDIT_COLLECT_END: string = 'onAllCreditCollectEnd';
    /** 獲得倍數 去累積的起始與結束 事件 */
    public static ON_MULTIPLE_ACCUMULATE_START: string = 'onMultipleAccumulateStart';
    public static ON_MULTIPLE_ACCUMULATE_END: string = 'onMultipleAccumulateEnd';
    /** 每顆目標金球開始收集的起始與結束 事件 */
    public static ON_TARGERT_COLLECT_START: string = 'onTargertCollectStart';
    public static ON_TARGERT_COLLECT_END: string = 'onTargertCollectEnd';
    /** 每個C1球開始收集的起始與結束 事件 */
    public static ON_BASE_CREDIT_COLLECT_START: string = 'onBaseCreditCollectStart';
    public static ON_BASE_CREDIT_COLLECT_END: string = 'onBaseCreditCollectEnd';
    /** 目標金球最後獲得倍數結果 事件 */
    public static ON_GET_MULTIPLE_RESULT_START: string = 'onGetMultipleResultStart';
    public static ON_GET_MULTIPLE_RESULT_END: string = 'onGetMultipleResultEnd';
    /** BaseGame 滾停後顯示贏分在龍珠上 */
    public static ON_BASEGAME_WIN_DISPLAY: string = 'onBaseGameWinDisplay';
}

export class FreeGameEvent {
    /** special side ball show 事件  */
    public static ON_SIDE_BALL_SHOW: string = 'onSideBallShow';
    /** 滾停後 special 表現開始後 事件 */
    public static ON_SIDE_BALL_SHOW_AFTER: string = 'onSideBallShowAfter';
    //** show side ball score && wild show */
    public static ON_SIDE_BALL_SCORE_SHOW: string = 'onSideBallScoreShow';
    //** 結算前分數加總表現 */
    public static ON_BEFORE_END_SCORE_SHOW: string = 'onBeforeEndScoreShow';
    //** 結算前分數加總表現 -> win 加總 */
    public static ON_BEFORE_END_SCORE_SHOW_SKIP: string = 'onBeforeEndScoreShowSkip';
    //** 延展 Wild 表演 */
    public static ON_EXPAND_WILD: string = 'onExpandWild';
    /** */
    public static ON_CALCULATE_MULTIPLE: string = 'onCalculateMultiple';
}
