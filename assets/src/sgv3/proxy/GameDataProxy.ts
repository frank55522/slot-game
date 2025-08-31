import { CoreGameDataProxy } from '../../core/proxy/CoreGameDataProxy';
import { Logger } from '../../core/utils/Logger';
import { MathUtil } from '../../core/utils/MathUtil';
import { PlayerData } from '../../core/vo/PlayerData';
import { CommonSetting } from '../vo/config/CommonSetting';
import { GameData } from '../vo/config/GameData';
import { GameSceneData } from '../vo/config/GameSceneData';
import { SceneSetting } from '../vo/config/SceneSetting';
import { AllWinData } from '../vo/data/AllWinData';
import { GameScene } from '../vo/data/GameScene';
import { GameHitPattern } from '../vo/enum/GameHitPattern';
import { GameModule } from '../vo/enum/GameModule';
import { WinBoardState } from '../vo/enum/WinBoardState';
import { JackpotEvent } from '../vo/event/JackpotEvent';
import { SymbolMatchInfo } from '../vo/match/SymbolMatchInfo';
import { SpinResult } from '../vo/result/SpinResult';
import { UserSetting } from '../vo/setting/UserSetting';
import { InitEvent } from '../vo/event/InitEvent';
import { GameStateSetting } from '../vo/setting/GameStateSetting';
import { GameStateResult } from '../vo/result/GameStateResult';
import { CommonGameResult } from '../vo/result/CommonGameResult';
import { SpecialHitInfo } from '../vo/enum/SpecialHitInfo';
import { StateMachineProxy } from './StateMachineProxy';
import { TSMap } from '../../core/utils/TSMap';
import { NetworkProxy } from '../../core/proxy/NetworkProxy';
import { RecoveryData } from '../vo/data/RecoveryData';
import { SpecialFeatureResult } from '../vo/result/SpecialFeatureResult';
import { WinType } from '../vo/enum/WinType';
import { UIEvent } from 'common-ui/proxy/UIEvent';
import { JackpotPool } from '../util/Constant';

/** 全遊戲資料 */
export class GameDataProxy extends CoreGameDataProxy {
    public curEmblemLevel: number[] = [];
    public emblemLevelRange: number[] = [];
    protected _gameData: GameData;
    protected _userSetting: UserSetting;

    protected _sceneSetting: SceneSetting;
    protected _commonSetting: CommonSetting;

    protected _gameSceneMap: TSMap<string, string>;

    public constructor(gameData: GameData = new GameData()) {
        super(gameData, new PlayerData());
        this._gameData = this.gameData as GameData;
        this._gameSceneMap = new TSMap<string, string>();
    }

    // ============================ Refactor ============================
    /**
     * 取得場景資料
     * @param sceneName 場景名稱，如Game_1
     * */
    public getSceneDataByName(sceneName: string): GameSceneData {
        return this._sceneSetting.getGameSceneDataByName(sceneName);
    }

    /**
     * 透過 遊戲類型 取得對應的贏分模式
     * @param sceneName 數學狀態id
     */
    public getInitShowPatternById(sceneName: string): GameHitPattern {
        let stateSetting: GameStateSetting = this.getStateSettingByName(sceneName);
        if (stateSetting != undefined) {
            return GameHitPattern[stateSetting.gameHitPattern];
        } else {
            Logger.w('[StateId ' + sceneName + '] Get HitPattern Error');
            return undefined;
        }
    }

    /**
     * 透過 遊戲類型 取得對應的設定
     * @param sceneName 數學狀態id
     */
    public getStateSettingById(sceneName: string): GameStateSetting {
        if (this.initEventData.gameStateSettings.length > 0) {
            let entity: GameStateSetting;
            for (entity of this.initEventData.gameStateSettings) {
                if (entity.gameSceneId == sceneName) return entity;
            }
        } else {
            Logger.w('[StateId ' + sceneName + '] Get StateSetting By Id Error, ExecuteSetting id not match!!');
            return undefined;
        }
    }

    /**
     * 透過 遊戲場景名稱 取得對應的設定
     * @param sceneName 遊戲場景名稱
     */
    public getStateSettingByName(sceneName: string): GameStateSetting {
        let result: GameStateSetting = this.getStateSettingById(sceneName);
        if (result != undefined) return result;
        else {
            Logger.w('[SceneName ' + sceneName + '] Get StateSetting By Name Error, ExecuteSetting id not match!!');
            return undefined;
        }
    }

    /** 取得 場景資料 */
    public get sceneSetting(): SceneSetting {
        return this._sceneSetting;
    }
    public set sceneSetting(_val: SceneSetting) {
        this._sceneSetting = _val;
    }

    /** 取得本機儲存的 key 值 */
    public get localStorageKey(): string {
        return 'slot_' + this.userName + '_' + this.machineType;
    }

    public get userName(): string {
        return this.userId;
    }

    public get localStorageSoundKey(): string {
        return this.userName + '_soundOn';
    }

    // ============================ Member ============================
    /** 取得 init 設定資料 */
    public get initEventData(): InitEvent {
        return this._gameData.initEventData;
    }
    public set initEventData(_val: InitEvent) {
        this._gameData.initEventData = _val;
    }

    /** 取得 userSetting */
    public get userSetting(): UserSetting {
        return this._userSetting;
    }
    public set userSetting(_val: UserSetting) {
        this._userSetting = _val;
    }

    /** 取得 commonSetting */
    public get commonSetting(): CommonSetting {
        return this._commonSetting;
    }
    public set commonSetting(_val: CommonSetting) {
        this._commonSetting = _val;
    }

    /** 取得 spin 設定資料 */
    public get spinEventData(): SpinResult {
        return this._gameData.spinEventData;
    }
    public set spinEventData(_val: SpinResult) {
        this._gameData.spinEventData = _val;
    }

    /** 取得 Spin 序號 */
    public get spinSequenceNumber(): number {
        return this._gameData.spinSequenceNumber;
    }
    public set spinSequenceNumber(_val: number) {
        this._gameData.spinSequenceNumber = _val;
    }

    /** 當前數學遊戲狀態資料 */
    public get curStateResult(): GameStateResult {
        return this._gameData.curStateResult;
    }
    public set curStateResult(_val: GameStateResult) {
        this._gameData.curStateResult = _val;
    }

    /** 當前回合表演資料 */
    public get curRoundResult(): CommonGameResult {
        return this._gameData.curRoundResult;
    }
    public set curRoundResult(_val: CommonGameResult) {
        this._gameData.curRoundResult = _val;
    }

    /** 斷線前數學遊戲狀態資料 */
    public get reStateResult(): RecoveryData {
        return this._gameData.recoveryState;
    }
    public set reStateResult(_val: RecoveryData) {
        this._gameData.recoveryState = _val;
    }
    /** Mini Game點擊金幣紀錄資料 */
    public get reSymbolClickedList(): number[] {
        return this._gameData.recoveryState.symbolClickedList;
    }
    public set reSymbolClickedList(_val: number[]) {
        this._gameData.recoveryState.symbolClickedList = _val;
    }

    /** 預設贏分模式 */
    public get initHitPattern(): GameHitPattern {
        return this._gameData.initHitPattern;
    }
    public set initHitPattern(_val: GameHitPattern) {
        this._gameData.initHitPattern = _val;
    }

    /** 觸發 Jackpot */
    public get onHitJackpot(): boolean {
        return this._gameData.onHitJackpot;
    }
    public set onHitJackpot(_val: boolean) {
        this._gameData.onHitJackpot = _val;
    }

    /** 是否可以更新 Jackpot Pool */
    public get canUpdateJackpotPool(): boolean {
        return this._gameData.canUpdateJackpotPool;
    }
    public set canUpdateJackpotPool(_val: boolean) {
        this._gameData.canUpdateJackpotPool = _val;
    }

    /** 拉中 Jackpot 類型為 Grand or Major */
    public get hitJackpotPoolTypes(): number[] {
        return this._gameData.hitJackpotPoolTypes;
    }
    public set hitJackpotPoolTypes(_val: number[]) {
        this._gameData.hitJackpotPoolTypes = _val;
    }

    /** Jackpot 資料 */
    public get jackpotData(): JackpotEvent[] {
        return this._gameData.jackpotData;
    }
    public set jackpotData(_val: JackpotEvent[]) {
        this._gameData.jackpotData = _val;
    }

    /** 彩金 */
    public get credit(): number {
        return this._gameData.credit;
    }
    public set credit(_val: number) {
        this._gameData.credit = _val;
    }

    public get tempWonCredit(): number {
        return this._tempWonCredit;
    }

    public set tempWonCredit(_val: number) {
        this._tempWonCredit = _val;
        this._cash = MathUtil.sub(this.realCash, this._tempWonCredit);
    }

    public resetTempWonCredit() {
        this.tempWonCredit = 0;
    }

    /** 總贏得彩金 */
    public get playerTotalWin(): number {
        return this._gameData.playerTotalWin;
    }
    public set playerTotalWin(_val: number) {
        this._gameData.playerTotalWin = _val;
    }

    /** 滾分結束 */
    public get rollingMoneyEnd(): boolean {
        return this._gameData.rollingMoneyEnd;
    }
    public set rollingMoneyEnd(_val: boolean) {
        this._gameData.rollingMoneyEnd = _val;
    }

    /** 贏分組合演過一次 */
    public get showWinOnceComplete(): boolean {
        return this._gameData.showWinOnceComplete;
    }
    public set showWinOnceComplete(_val: boolean) {
        this._gameData.showWinOnceComplete = _val;
    }

    /** 是否為自動模式 */
    public get onAutoPlay(): boolean {
        return this._gameData.onAutoPlay;
    }
    public set onAutoPlay(_val: boolean) {
        this._gameData.onAutoPlay = _val;
    }

    /** 自動模式 - 目前次數 */
    public get curAutoTimes(): number {
        return this._gameData.curAutoTimes;
    }
    public set curAutoTimes(_val: number) {
        this._gameData.curAutoTimes = _val;
    }

    /** 自動模式 - 最大次數 */
    public get maxAutoTimes(): number {
        return this._gameData.maxAutoTimes;
    }
    public set maxAutoTimes(_val: number) {
        this._gameData.maxAutoTimes = _val;
    }

    /** 倒數計時是否啟用 */
    public get isCountdownEnabled(): boolean {
        return this._gameData.isCountdownEnabled;
    }
    public set isCountdownEnabled(_val: boolean) {
        this._gameData.isCountdownEnabled = _val;
    }

    /** 臨時Big Win門檻測試 */
    public get tempBigWinThreshold(): number {
        return this._gameData.tempBigWinThreshold;
    }
    public set tempBigWinThreshold(_val: number) {
        this._gameData.tempBigWinThreshold = _val;
    }

    /** 紀錄BaseGame的TurboMode狀態 */
    public get curTurboMode(): boolean {
        return this._gameData.curTurboMode;
    }
    public set curTurboMode(_val: boolean) {
        this._gameData.curTurboMode = _val;
    }

    /** 判斷是否要顯示TurboModeMsg */
    public get isShowTurboModeMsg(): boolean {
        return this._gameData.isShowTurboModeMsg;
    }
    public set isShowTurboModeMsg(_val: boolean) {
        this._gameData.isShowTurboModeMsg = _val;
    }

    /** 玩家選擇的遊戲狀態operation - GameOperation(Enum String) */
    public get curGameOperation(): string {
        return this._gameData.curGameOperation;
    }
    public set curGameOperation(_val: string) {
        this._gameData.curGameOperation = _val;
    }

    /** 滾分中 */
    public get scrollingWinLabel(): boolean {
        return this._gameData.scrollingWinLabel;
    }
    public set scrollingWinLabel(_val: boolean) {
        this._gameData.scrollingWinLabel = _val;
    }

    /** 是否可以觸發滾分急停了 */
    public get scrollingWinLabelCanSkip(): boolean {
        return this._gameData.scrollingWinLabelCanSkip;
    }

    public set scrollingWinLabelCanSkip(_val: boolean) {
        this._gameData.scrollingWinLabelCanSkip = _val;
    }

    /** ScrollingEnd是否播放了 */
    public get scrollingEndPlayed(): boolean {
        return this._gameData.scrollingEndPlayed;
    }

    public set scrollingEndPlayed(_val: boolean) {
        this._gameData.scrollingEndPlayed = _val;
    }

    /** 投注組合列表 */
    public get totalBetList(): number[] {
        return this._gameData.totalBetList;
    }
    public set totalBetList(_val: number[]) {
        this._gameData.totalBetList = _val;
    }

    /** Jackpot投注所有列表 */
    public get jackpotAllBetList(): number[] {
        return this._gameData.jackpotAllBetList;
    }
    public set jackpotAllBetList(_val: number[]) {
        this._gameData.jackpotAllBetList = _val;
    }

    /** 投注組合index */
    public get totalBetIdx(): number {
        return this._gameData.totalBetIdx;
    }
    public set totalBetIdx(_val: number) {
        this._gameData.totalBetIdx = _val;
    }

    /** 選擇哪個feature */
    public get featureMode(): number {
        return this._gameData.featureMode;
    }
    public set featureMode(_val: number) {
        this._gameData.featureMode = _val;
    }

    /** 遊戲屬於哪種BetType */
    public get gameModule(): GameModule {
        return this._gameData.gameModule;
    }
    public set gameModule(_val: GameModule) {
        this._gameData.gameModule = _val;
    }

    /** 是否大獎直接滾停*/
    public get isBingWinForceComplete(): boolean {
        return true;
    }

    /** 分級贏分面板狀態 */
    public get winBoardState(): WinBoardState {
        return this._gameData.winBoardState;
    }
    public set winBoardState(_val: WinBoardState) {
        this._gameData.winBoardState = _val;
    }

    /** 目前場景資料 */
    public get curScene(): string {
        return this._gameData.curScene;
    }
    public set curScene(_val: string) {
        this._gameData.curScene = _val;
    }

    /** 前場景資料 */
    public get preScene(): string {
        return this._gameData.preScene;
    }
    public set preScene(_val: string) {
        this._gameData.preScene = _val;
    }

    /** 是否為 Free game結束 */
    public get afterFeatureGame(): boolean {
        return this._gameData.afterFeatureGame;
    }
    public set afterFeatureGame(_val: boolean) {
        this._gameData.afterFeatureGame = _val;
    }

    /** 全贏線資料 */
    public get curWinData(): AllWinData {
        return this._gameData.curWindData;
    }
    public set curWinData(_val: AllWinData) {
        this._gameData.curWindData = _val;
    }

    /** 狀態贏線資料 */
    public get stateWinData(): AllWinData {
        return this._gameData.stateWinData;
    }
    public set stateWinData(_val: AllWinData) {
        this._gameData.stateWinData = _val;
    }

    /** 最大押分的列表長度 */
    public get maxTotalBetLength(): number {
        return this._gameData.maxTotalBetLength;
    }
    public set maxTotalBetLength(_val: number) {
        this._gameData.maxTotalBetLength = _val;
    }

    /** 是否為報表模式 */
    public get isReportMode(): boolean {
        return this._gameData.isReportMode;
    }
    public set isReportMode(_val: boolean) {
        this._gameData.isReportMode = _val;
    }

    protected _symbolMatchInfo: SymbolMatchInfo;
    public get symbolMatchInfo(): SymbolMatchInfo {
        const self = this;
        if (!self._symbolMatchInfo) self._symbolMatchInfo = new SymbolMatchInfo();
        return self._symbolMatchInfo;
    }

    protected _curHitPattern: GameHitPattern = null;
    /** 當前贏分模式 */
    public set curHitPattern(val: GameHitPattern) {
        this._curHitPattern = val;
        switch (+GameHitPattern[this._curHitPattern]) {
            case GameHitPattern.LeftToRight:
            case GameHitPattern.RightToLeft:
            case GameHitPattern.DoubleHit:
                this.gameModule = GameModule.LineGame;
                break;
        }
    }
    public get curHitPattern(): GameHitPattern {
        return this._curHitPattern;
    }

    /** 投注 */
    public set curBet(val) {
        this._gameData.curBet = val;
        this.saveUserSetting();
    }
    public get curBet(): number {
        return this._gameData.curBet;
    }

    protected _curDenomMultiplier: number = NaN;
    /** Denom multiplier */
    public set curDenomMultiplier(val) {
        this._curDenomMultiplier = val;
        this.saveUserSetting();
    }
    public get curDenomMultiplier(): number {
        return this._curDenomMultiplier;
    }

    protected _curFeatureBet: number = NaN;
    /** Feature Bet */
    public set curFeatureBet(val) {
        this._curFeatureBet = val;
        this.saveUserSetting();
    }
    public get curFeatureBet(): number {
        return this._curFeatureBet;
    }

    public get curFeatureIdx(): number {
        const featureBetList = this.initEventData.featureBetList;
        return featureBetList.indexOf(this.curFeatureBet);
    }

    protected _curLine: number = NaN;
    /** 線數 */
    public set curLine(val) {
        this._curLine = val;
    }
    public get curLine(): number {
        return this._curLine;
    }

    protected _curDenom: number = NaN;
    /** 面額 */
    public set curDenom(val) {
        this._curDenom = val;
        let denom = MathUtil.mul(this.curDenom, 0.001);
        this.credit = MathUtil.div(this.cash, denom);

        this.sendNotification(UIEvent.UPDATE_PLAYER_BALANCE, this.cash);
        this.saveUserSetting();
    }
    public get curDenom(): number {
        return MathUtil.mul(this._curDenom, 1000); // DefaultSettingCommand 有先將 Denom 除 100 方便表演，真正使用時，需乘回來.
    }

    /** 額外投注 */
    public set curExtraBet(val) {
        this._gameData.curExtraBet = val;
        this.saveUserSetting();
    }
    public get curExtraBet(): string {
        return this._gameData.curExtraBet;
    }

    /** 投注組合取得的值 */
    public set curTotalBet(val) {
        this._gameData.curTotalBet = val;
        this.saveUserSetting();
    }
    public get curTotalBet(): number {
        return this._gameData.curTotalBet;
    }

    /**FG=>BG 總贏分的倍率*/
    public get totalWinAmount(): number {
        return this._gameData.totalWinAmount;
    }

    public set totalWinAmount(val) {
        this._gameData.totalWinAmount = val;
    }

    /**FG=>BG 滾分時間 ms */
    public set totalScoringTime(value: number) {
        this._gameData.totalScoringTime = value;
    }
    public get totalScoringTime(): number {
        return this._gameData.totalScoringTime;
    }

    /**FG=>BG 獎項類別 ms */
    public set totalWinType(value: WinType) {
        this._gameData.totalWinType = value;
    }
    public get totalWinType(): WinType {
        return this._gameData.totalWinType;
    }

    /**聲音開關狀態 */
    public set soundEnableState(value: boolean) {
        this._gameData.soundEnableState = value;
        if (window.localStorage) localStorage.setItem(this.localStorageSoundKey, JSON.stringify(value));
    }

    public get soundEnableState(): boolean {
        return this._gameData.soundEnableState;
    }

    /** 判斷是否可以spin */
    public get readySpin(): boolean {
        return this._gameData.readySpin;
    }
    public set readySpin(v: boolean) {
        this._gameData.readySpin = v;
    }

    /** 判斷是否spin中 */
    public get isSpinning(): boolean {
        return this._gameData.isSpinning;
    }
    public set isSpinning(v: boolean) {
        this._gameData.isSpinning = v;
    }

    /** 判斷是否可以spin */
    public get isIdleReminding(): boolean {
        return this._gameData.isIdleReminding;
    }
    public set isIdleReminding(v: boolean) {
        this._gameData.isIdleReminding = v;
    }

    private _orientationEvent: string;
    /** 接收到的orientation事件*/
    public get orientationEvent(): string {
        return this._orientationEvent;
    }
    public set orientationEvent(v: string) {
        this._orientationEvent = v;
    }

    /** 預設的ExtraBetIndex */
    public get defaultExtraBetIndex(): number {
        return 0;
    }

    /** 接收到的Fortune Level數值 */
    private _fortuneLevel: string;
    public get lastFortuneLevel(): string {
        return this._fortuneLevel;
    }
    public set lastFortuneLevel(v: string) {
        this._fortuneLevel = v;
    }

    /** 是否有收到 Feature selection 的結果 */
    public get hasSelectionResponse(): boolean {
        return this._gameData.hasSelectionResponse;
    }
    public set hasSelectionResponse(_val: boolean) {
        this._gameData.hasSelectionResponse = _val;
    }

    /** 是否正在載入或開啟 Help view */
    public get isHelpOpen(): boolean {
        return this._gameData.isLoadingHelp;
    }
    public set isHelpOpen(_val: boolean) {
        this._gameData.isLoadingHelp = _val;
    }

    /** 遊戲速度 */
    public get curSpeedMode(): string {
        return this._gameData.curSpeedMode;
    }
    public set curSpeedMode(state: string) {
        this._gameData.curSpeedMode = state;
    }

    /** 是否準備進入 Mini game */
    public get isReadyEnterMiniGame(): boolean {
        return this._gameData.isReadyEnterMiniGame;
    }
    public set isReadyEnterMiniGame(_val: boolean) {
        this._gameData.isReadyEnterMiniGame = _val;
    }
    // ============================ Method ============================

    /** 現金 */
    protected _cash: number = NaN;

    public realCash: number = 0;
    public _tempWonCredit: number = 0;

    /**
     * 這邊給changeBalance塞資料用
     * @author
     */
    public setBmd(value: number, isBalance: boolean = false) {
        this.realCash = value;
        this._cash = MathUtil.sub(this.realCash, this._tempWonCredit);
        let denom = MathUtil.mul(this.curDenom, 0.001);
        this.credit = MathUtil.div(this._cash, denom);
    }

    public get cash(): number {
        return this._cash;
    }

    protected _runWinComplete: boolean = false;
    public set runWinComplete(val: boolean) {
        this._runWinComplete = val;
    }
    /** 滾分完成 */
    public get runWinComplete(): boolean {
        return this._runWinComplete;
    }

    //檢查 credit 足不足夠一把
    public checkCreditEnough(): boolean {
        //針對Recovery流程處理
        if (this.reStateResult != null) {
            return true;
        }
        //正常流程
        if (this.curScene != GameScene.Game_1 || this.onFreePlay == true) {
            return true;
        } else {
            if (this.cash < this.curTotalBet) {
                Logger.i('餘額不足');
                this.networkProxy.sendNotEnoughMsg();
                return false;
            } else {
                return true;
            }
        }
    }

    /**
     * 確認reel可以spin
     */
    public checkReelCanSpin(): boolean {
        if (
            (this.gameState == StateMachineProxy.GAME1_IDLE ||
                this.gameState == StateMachineProxy.GAME2_IDLE ||
                this.gameState == StateMachineProxy.GAME4_IDLE) &&
            this.checkCreditEnough()
        )
            return true;
        return false;
    }
    //  ============= [Method 相關] =============
    /**
     * Credit 透過 curDenom 轉換為 Cash
     * @param _data - 值
     */
    public convertCredit2Cash(_data: number): number {
        return MathUtil.mul(_data, this.curDenom, 0.001);
    }

    public convertCash2Credit(_data: number): number {
        return MathUtil.div(_data, this.curDenom, 0.001);
    }

    /** 依照玩家選擇的denom顯示對應的分數 */
    public getCreditByDenomMultiplier(_data: number): number {
        return MathUtil.div(_data, this.curDenomMultiplier);
    }

    /** 載入玩家該遊戲使用的 denom、bet */
    public loadUserSetting(): void {
        try {
            if (window.localStorage) {
                this.userSetting = JSON.parse(localStorage.getItem(this.localStorageKey));
                let soundState = JSON.parse(localStorage.getItem(this.localStorageSoundKey));
                this.soundEnableState = soundState == null ? true : soundState;
            }
        } catch (e) {
            let userData: UserSetting = new UserSetting();
            userData.denom = `${this.initEventData.denoms[0]}`;
            this.userSetting = userData;
        }
    }

    /** 儲存玩家使用習慣 */
    protected saveUserSetting(): void {
        let saveData: UserSetting = new UserSetting();
        saveData.denom = this.curDenom.toString();
        saveData.totalBet = this.curTotalBet.toString();
        saveData.line = this.curLine.toString();
        saveData.extraBet = this.curExtraBet;
        saveData.betMultiplier = this.curBet.toString();
        saveData.denomMultiplier = this.curDenomMultiplier.toString();
        saveData.featureBet = this.curFeatureBet.toString();
        try {
            if (window.localStorage) localStorage.setItem(this.localStorageKey, JSON.stringify(saveData));
        } catch (e) {}
    }

    /**
     * 選擇 TotalBet，遊戲設定所選的值.
     * @param _value User 所選值
     * @param _denomMultiplier 面額倍率
     */
    public resetBetInfo(_value: number, _denomMultiplier?: number, _betMultiplier?: number, _featureBet?: number): any {
        let _exist: boolean = false;
        // maxBetLine > 0 代表是 Line Game，否則是 Way Game
        // Line Game curLine 固定為 maxBetLine，Way Game curLine 固定為 screenColumn
        const maxBetLine = this.initEventData.executeSetting.baseGameSetting.maxBetLine;
        const screenColumn = this.initEventData.executeSetting.baseGameSetting.screenColumn;
        this.curLine = maxBetLine > 0 ? maxBetLine : screenColumn;
        // 暫時固定 No Extra Bet
        this.curExtraBet = this.initEventData.executeSetting.baseGameSetting.betSpec.extraBetTypeList[0];
        if (this.isOmniChannel()) {
            this.curBet = _betMultiplier;
            this.curDenomMultiplier = _denomMultiplier;
            this.curFeatureBet = _featureBet;
            _exist = true;
        } else {
            const betIndex = this.totalBetList.findIndex((bet, index) => bet == _value);
            if (betIndex >= 0) {
                this.curBet = this.initEventData.betMultiplier[betIndex];
                _exist = true;
            } else {
                _exist = false;
            }
        }

        if (_exist) {
            // 設定 TotalBet
            this.curTotalBet = _value;
            this.networkProxy.updateTotalBet(this.curTotalBet);
        } else {
            Logger.w('投注組合不存在目前設定的投注數字 : ' + _value);
        }
    }

    /** 重置遊戲參數 */
    public resetGameParams() {
        const self = this;
        self.curStateResult = null;
        self.curRoundResult = null;
        self.curHitPattern = self.initHitPattern;
        self.curWinData.dispose();
    }

    /**
     * 根據數學id取得對應的frame資料
     * */
    public getCurrentReelSymbolIDIndexByID(stripId: number): number {
        const self = this;
        if (!self._sceneSetting) return -1;
        const gameSceneData = self._sceneSetting.getGameSceneDataByName(self.curScene);
        if (!gameSceneData) return -1;
        const index = gameSceneData.reelSymbolFrameByIDs.indexOf(stripId);
        return index;
    }

    /** 是否這場資料有特殊表演 */
    public isHitSpecial(): boolean {
        const self = this;
        if (!self.curRoundResult) return false;
        if (!self.curRoundResult.specialFeatureResult) return false;
        if (self.curRoundResult.specialFeatureResult.length > 0) {
            for (let i = 0; i < self.curRoundResult.specialFeatureResult.length; i++) {
                if (
                    self.curRoundResult.specialFeatureResult[i].specialHitInfo !=
                    SpecialHitInfo[SpecialHitInfo.noSpecialHit]
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    /** 是否有中 Mini game */
    public isHitMiniGame(): boolean {
        const self = this;
        let isHitMiniGame = false;
        const hasBonus01 = (result: SpecialFeatureResult) =>
            result.specialHitInfo === SpecialHitInfo[SpecialHitInfo.bonusGame_01];
        isHitMiniGame = self?.curRoundResult?.specialFeatureResult.some(hasBonus01);
        return isHitMiniGame ? isHitMiniGame : false;
    }

    /** 是否這場資料有中 Grand */
    public isHitGrand(): boolean {
        const self = this;
        let isHitGrand = false;
        const hasBonus02 = (result: SpecialFeatureResult) =>
            result.specialHitInfo === SpecialHitInfo[SpecialHitInfo.bonusGame_02];
        isHitGrand = self?.curRoundResult?.specialFeatureResult.some(hasBonus02);
        return isHitGrand ? isHitGrand : false;
    }

    public checkJackpotPool() {
        // 當連中 2次 Grand 時，下一次場景需要更新到最新的 JackpotPool 數值
        this.hitJackpotPoolTypes = [];
        if (this.spinEventData.bonusGameResult) {
            const lastBonusResult = this.spinEventData.bonusGameResult.bonusGameOneRoundResult[0];
            const result = lastBonusResult.jpHitInfo;
            this.hitJackpotPoolTypes = lastBonusResult.hitPool || [];

            this.sendNotification(JackpotPool.HIT_JACKPOT_TO_POOL_VALUE_UPDATE, result);
        }
    }

    /** 是否資料有 Feature selection */
    public hasFeatureSelection(): boolean {
        const self = this;
        let hasFeatureSelection = false;
        const hasWaitForClient = (result: SpecialFeatureResult) =>
            result.specialHitInfo === SpecialHitInfo[SpecialHitInfo.waitingForClient];
        hasFeatureSelection = self?.spinEventData?.baseGameResult?.specialFeatureResult.some(hasWaitForClient);
        return hasFeatureSelection ? hasFeatureSelection : false;
    }

    public getJackpotPoolRangeIndexWithBet(): number {
        const jpPoolData = this.initEventData.executeSetting.jackpotSetting.jackpotPoolData[0];
        const wayBetList = this.initEventData.executeSetting.baseGameSetting.betSpec.waysBetList;
        const curBetIndex = wayBetList.findIndex((bet) => bet == this.curBet);
        const betRangeMapIndex = jpPoolData.jackpotExtendSetting.betRangeMap[curBetIndex];

        return betRangeMapIndex;
    }

    public getInitEmblemLevel(): number[] {
        let level: number[] = [];
        level[0] = this.initEventData.initialData.seatStatusCache.seatInfo.miniGameWaterLevel;
        this.curEmblemLevel = level;
        return level;
    }

    public getEmblemLevelInBaseGame() {
        let level: number[] = [];
        level[0] = this.spinEventData.baseGameResult.extendInfoForbaseGameResult.seatInfo.miniGameWaterLevel;
        return level;
    }

    public isOmniChannel(): boolean {
        const denomMultiplierList = this.initEventData.denomMultiplier;
        if (denomMultiplierList && denomMultiplierList.length > 1) {
            return true;
        } else {
            return false;
        }
    }

    /** 是否為 Free Play 模式 */
    public get onFreePlay(): boolean {
        return this._gameData.onFreePlay;
    }
    public set onFreePlay(_val: boolean) {
        this._gameData.onFreePlay = _val;
    }

    //紀錄是否為初次Spin
    private _isFirstSpin: boolean = false;
    public get isFirstSpin(): boolean {
        return this._isFirstSpin;
    }
    public set isFirstSpin(_val: boolean) {
        this._isFirstSpin = _val;
    }

    // 紀錄BaseGame大獎預告與瞇牌狀態
    private _previewType: string = '';
    public get previewType(): string {
        return this._previewType;
    }
    public set previewType(_val: string) {
        this._previewType = _val;
    }
    
    protected _networkProxy: NetworkProxy;
    protected get networkProxy(): NetworkProxy {
        if (!this._networkProxy) {
            this._networkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._networkProxy;
    }
}
