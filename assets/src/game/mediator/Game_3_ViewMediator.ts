import { _decorator, Node, SystemEvent, EventTouch, game, macro } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { StateMachineCommand } from '../../core/command/StateMachineCommand';
import { StateMachineObject } from '../../core/proxy/CoreStateMachineProxy';
import { Formula } from '../../core/utils/Formula';
import { Logger } from '../../core/utils/Logger';
import { SceneManager } from '../../core/utils/SceneManager';
import { SaveRecoveryDataCommand } from '../../sgv3/command/recovery/SaveRecoveryDataCommand';
import { StateMachineProxy } from '../../sgv3/proxy/StateMachineProxy';
import { WebBridgeProxy } from '../../sgv3/proxy/WebBridgeProxy';
import {
    GameStateProxyEvent,
    JackpotPool,
    ScreenEvent,
    StateWinEvent,
    ViewMediatorEvent
} from '../../sgv3/util/Constant';
import { GlobalTimer } from '../../sgv3/util/GlobalTimer';
import { GameSceneData } from '../../sgv3/vo/config/GameSceneData';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { MiniGameSymbol } from '../../sgv3/vo/enum/MiniGameSymbolType';
import { SpecialHitInfo } from '../../sgv3/vo/enum/SpecialHitInfo';
import { BonusGameOneRoundResult } from '../../sgv3/vo/result/BonusGameOneRoundResult';
import { AudioManager } from '../../audio/AudioManager';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { Game_3_View } from '../view/Game_3_View';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
const { ccclass } = _decorator;

@ccclass('Game_3_ViewMediator')
export class Game_3_ViewMediator extends BaseMediator<Game_3_View> {
    public static readonly NAME: string = 'Game_3_ViewMediator';

    // SceneData
    protected mySceneName: string = '';
    protected myGameScene: GameScene = null;
    protected mySceneData: GameSceneData = null;

    /** Mini Game 結果 */
    private miniResultData: Array<number> = new Array<number>();
    /** 還沒點擊的 index */
    private symbolClickState: Array<number> = new Array<number>();
    /** 已被選擇的 index */
    private symbolClickedList: Array<number> = new Array<number>();
    /** 開獎順序紀錄陣列 */
    private openingSeqArr: { symbolShowObj: any; btnIdx: number }[] = [];

    private grandCnt = 0;
    private majorCnt = 0;
    private minorCnt = 0;
    private miniCnt = 0;
    private miniResultLength = 0;
    private isAutoClick: boolean = false;
    private autoClickTimerKey: string = 'autoClickTimer';
    private countdownTimerId: number;
    private autoStartTimerId: number;

    public miniGameEnd = true;

    protected lastSetupEventList: string[];

    protected defaultInterestList: string[] = [GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE, ViewMediatorEvent.LEAVE];

    protected myInterestsList: string[] = [
        GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE,
        StateWinEvent.ON_GAME3_SHOW_INFO,
        StateWinEvent.ON_GAME3_SHOW_SELECTION,
        StateWinEvent.SHOW_LAST_CREDIT_BOARD,
        ViewMediatorEvent.SHOW_WON_SPIN_DATA,
        ViewMediatorEvent.ENTER,
        ViewMediatorEvent.RECOVERY_LOAD_VIEW,
        ScreenEvent.ON_SPIN_DOWN
    ];

    public constructor(name?: string, component?: any) {
        super(name, component);
        Logger.i('[' + Game_3_ViewMediator.NAME + '] constructor()');
        const self = this;
        self.initView();

        // 取得該場景的資料
        let parseName: string[] = Game_3_ViewMediator.NAME.split('_');
        self.mySceneName = parseName[0] + '_' + parseName[1];
        self.mySceneData = self.gameDataProxy.getSceneDataByName(self.mySceneName);
        self.myGameScene = self.mySceneName;

        this.view.node.active = false;
    }

    protected lazyEventListener(): void { }

    public listNotificationInterests(): Array<any> {
        const self = this;
        let result: string[];
        if (self.lastSetupEventList) {
            result = self.lastSetupEventList;
            self.lastSetupEventList = null;
        } else if (self.gameDataProxy.curScene == self.myGameScene) {
            self.lastSetupEventList = self.myInterestsList;
            result = self.myInterestsList;
        } else {
            self.lastSetupEventList = self.defaultInterestList;
            result = self.defaultInterestList;
        }
        return result;
    }

    public handleNotification(notification: puremvc.INotification): void {
        super.handleNotification(notification);
        const self = this;
        let name = notification.getName();

        switch (name) {
            //#region Common Event
            case ViewMediatorEvent.ENTER:
                self.enterMediator();
                break;
            case ViewMediatorEvent.LEAVE:
                self.leaveMediator();
                break;
            case GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE: // 讓Mediator進入畫面前必須要重整監聽事件
                self.refreshMediatorEventList();
                break;
            case StateWinEvent.ON_GAME3_SHOW_INFO:
                self.showMiniGameInfo(notification.getBody());
                break;
            case StateWinEvent.ON_GAME3_SHOW_SELECTION:
                self.view.showClickSymbol(true);
                break;
            case StateWinEvent.SHOW_LAST_CREDIT_BOARD:
                self.showWonCreditBoard();
                break;
            case ScreenEvent.ON_SPIN_DOWN:
                self.onSpinDown();
                break;
            case ViewMediatorEvent.RECOVERY_LOAD_VIEW:
                this.recoveryMiniGameStatus();
                break;
        }
    }

    /** 建立畫面 */
    protected initView(): void {
        const self = this;

        self.view.init(self.gameDataProxy.language);
    }

    /** 進入場景處理 */
    protected enterMediator() {
        const self = this;
        if (self.gameDataProxy.curScene !== self.mySceneName) return;
        self.view.node.active = true;
        self.webBridgeProxy.sendGameState('BonusGame');

        self.resetSymbolClickState();
        self.setMiniGameResultData();

        self.view.enterView();
        self.view.enableCountdown(true);
        self.openingSeqArr = [];

        self.grandCnt = 0;
        self.majorCnt = 0;
        self.minorCnt = 0;
        self.miniCnt = 0;
        self.facade.sendNotification(JackpotPool.CHANGE_SCENE);

        let buttonLength = self.view.getAllSymbolButton().length;
        for (let i = 0; i < buttonLength; i++) {
            self.view.getAllSymbolButton()[i].node.on(SystemEvent.EventType.TOUCH_END, self.onTouchTap, self);
        }
    }

    private resetSymbolClickState() {
        const self = this;

        //清除陣列
        self.symbolClickState.splice(0, self.symbolClickState.length);
        self.symbolClickedList.splice(0, self.symbolClickedList.length);
        let buttonLength = self.view.getAllSymbolButton().length;
        //取得畫面的點擊物件編號
        for (let i = 0; i < buttonLength; i++) {
            self.symbolClickState.push(i);
        }
    }

    private setMiniGameResultData() {
        const self = this;

        // 清空 miniResultData
        self.miniResultData.splice(0, self.miniResultData.length);

        // 取得 miniGame結果資料
        const getBonusResult = (result: BonusGameOneRoundResult) =>
            result.specialHitInfo === SpecialHitInfo[SpecialHitInfo.bonusGame_01];
        let result =
            self.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult.filter(getBonusResult)[0]
                .extendInfoForBonusGameResult.bonusGame15C3Result.script;

        result.forEach((x) => {
            self.miniResultData.push(x);
        });
        self.miniResultLength = self.miniResultData.length;
    }

    /** 離開場景處理 */
    protected leaveMediator() {
        const self = this;
        if (self.gameDataProxy.preScene !== GameScene.Init && self.gameDataProxy.preScene !== self.mySceneName) return;
        self.view.hideContent();
        GlobalTimer.getInstance().removeTimer(GameScene.Game_3 + ' leave');
        GlobalTimer.getInstance()
            .registerTimer(
                GameScene.Game_3 + ' leave',
                1.0,
                () => {
                    GlobalTimer.getInstance().removeTimer(GameScene.Game_3 + ' leave');
                    self.view.node.active = false;
                },
                self
            )
            .start();
        self.facade.sendNotification(JackpotPool.EXIT_SCENE, GameScene.Game_3);
    }

    /** 顯示提示 */
    protected showMiniGameInfo(enable: boolean) {
        const self = this;
        self.view.showMiniGameInfo(enable);
        if (enable) {
            self.miniGameEnd = false;
            self.isAutoClick = false;
            self.registerAutoClickSymbolTimer();
        }
    }

    /** 顯示結算分數面板 */
    protected showWonCreditBoard() {
        const self = this;
        self.view.showWonCreditBoard();
        self.facade.sendNotification(JackpotPool.MINIGAME_WINBOARD);
        // 移除已經表演過的bonus資料
        const removeResult = (result: BonusGameOneRoundResult) =>
            result.specialHitInfo != SpecialHitInfo[SpecialHitInfo.bonusGame_01];
        self.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult =
            self.gameDataProxy.spinEventData.bonusGameResult.bonusGameOneRoundResult.filter(removeResult);
    }

    private onSpinDown() {
        const self = this;
        if (self.miniGameEnd || self.isAutoClick) return;
        self.registerAutoClickSymbolTimer();
        let buttonList = self.view.getAllSymbolButton();

        let idx = self.symbolClickState[Formula.getRndInt(self.symbolClickState.length)];
        if (self.view.clickData.has(buttonList[idx].node.name) == false) {
            self.onClickSymbol(buttonList[idx].node, idx);
            self.view.getAllSymbolButton()[idx].node.off(SystemEvent.EventType.TOUCH_END, self.onTouchTap, self);
            return;
        }
    }

    private recoveryMiniGameStatus() {
        const self = this;

        // 顯示元寶
        self.view.showClickSymbol(false);
        if (this.gameDataProxy.reSymbolClickedList == null) {
            return; //玩家還未點選mini game金幣
        }

        //取得還原資料
        self.symbolClickedList = this.gameDataProxy.reSymbolClickedList;

        for (let i = 0; i < self.symbolClickedList.length; ++i) {
            let clickedID = self.symbolClickedList[i];
            //設定已被點選的金幣
            self.symbolClickState.forEach((element, index) => {
                if (element == clickedID) {
                    self.symbolClickState.splice(index, 1);
                }
            });
            let resultID = self.miniResultData.shift(); //取得開啟獎項

            //設定 View場景中的 UI物件
            self.view.ingotChangeToSymbol(clickedID, resultID, self.gameDataProxy.language, false);
            GlobalTimer.getInstance()
                .registerTimer(
                    'MiniGameTap' + clickedID,
                    0.5,
                    () => {
                        GlobalTimer.getInstance().removeTimer('MiniGameTap' + clickedID);
                        self.afterShowSymbol(resultID, clickedID);
                    },
                    self
                )
                .start();
            let buttonList = self.view.getAllSymbolButton();
            self.view.clickData.set(buttonList[clickedID].node.name, true);
        }

        if (!self.miniResultData.length) {
            self.miniGameEnd = true;
        }
    }

    //#region  ======================== Get Set Proxy ========================
    protected _gameDataProxy: GAME_GameDataProxy;
    protected get gameDataProxy(): GAME_GameDataProxy {
        const self = this;
        if (!self._gameDataProxy) {
            self._gameDataProxy = self.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return self._gameDataProxy;
    }

    private _webBridgeProxy: WebBridgeProxy;
    protected get webBridgeProxy(): WebBridgeProxy {
        const self = this;
        if (!self._webBridgeProxy) {
            self._webBridgeProxy = self.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return self._webBridgeProxy;
    }

    /** 更新 Mediator 監聽的事件 */
    protected refreshMediatorEventList(): void {
        const self = this;
        self.facade.removeMediator(self.mediatorName);
        self.facade.registerMediator(self);
    }

    private onTouchTap(e: EventTouch): void {
        const self = this;
        if (self.miniGameEnd || self.isAutoClick) return;
        self.registerAutoClickSymbolTimer();
        let idx: number = 0;
        let buttonList = self.view.getAllSymbolButton();
        while (idx < buttonList.length) {
            if (buttonList[idx].node == (e.currentTarget as Node)) {
                self.onClickSymbol(buttonList[idx].node, idx);
                self.view.getAllSymbolButton()[idx].node.off(SystemEvent.EventType.TOUCH_END, self.onTouchTap, self);
                return;
            }
            idx++;
        }
    }

    private onClickSymbol(btn: Node, symbolIdx: number) {
        const self = this;

        self.symbolClickState.forEach((element, index) => {
            if (element == symbolIdx) {
                self.symbolClickState.splice(index, 1);
                self.symbolClickedList.push(element);
            }
        });

        if (!self.view.clickData.get(btn.name)) {
            let resultID = self.miniResultData.shift();
            //傳送Recovery紀錄資料
            this.sendNotification(SaveRecoveryDataCommand.NAME, self.symbolClickedList);

            self.miniGameEnd = self.miniResultData.length == 0 ? true : false;

            self.view.ingotChangeToSymbol(symbolIdx, resultID, self.gameDataProxy.language, true);
            GlobalTimer.getInstance()
                .registerTimer(
                    'MiniGameTap' + btn.name,
                    self.mySceneData.bonusGameClickSymbolShowTime,
                    () => {
                        GlobalTimer.getInstance().removeTimer('MiniGameTap' + btn.name);
                        self.afterShowSymbol(resultID, symbolIdx);
                    },
                    self
                )
                .start();
            self.view.clickData.set(btn.name, true);
        } else {
            return;
        }
    }

    private afterShowSymbol(resultID: number, symbolIdx: number) {
        const self = this;
        self.openingSeqArr.push({ symbolShowObj: resultID, btnIdx: symbolIdx });

        switch (resultID) {
            case MiniGameSymbol.Grand:
                self.grandCnt++;
                break;
            case MiniGameSymbol.Major:
                self.majorCnt++;
                break;
            case MiniGameSymbol.Minor:
                self.minorCnt++;
                break;
            case MiniGameSymbol.Mini:
                self.miniCnt++;
                break;
        }

        if (self.miniResultLength == self.openingSeqArr.length) {
            self.onMiniGameEnd();
        } else {
            self.checkExpectationSymbol(resultID);
        }
    }

    private onMiniGameEnd() {
        const self = this;
        self.view.enableCountdown(false);
        clearInterval(self.countdownTimerId);
        clearTimeout(self.autoStartTimerId);
        self.countdownTimerId = self.autoStartTimerId = null;
        GlobalTimer.getInstance().removeTimer('WinJP');
        GlobalTimer.getInstance()
            .registerTimer(
                'WinJP',
                this.mySceneData.bonusGameWinSymbolShowTime,
                () => {
                    self.playMiniGameEndSound();
                    self.facade.sendNotification(
                        StateMachineCommand.NAME,
                        new StateMachineObject(StateMachineProxy.GAME3_SHOWWIN)
                    );
                },
                self
            )
            .start();

        let winType = self.getMaxWinType();
        self.view.highLightWinSymbol(winType, self.openingSeqArr, self.symbolClickState);
        self.sendNotification(JackpotPool.HIGHLIGHT_HIT_POOL, winType);

        AudioManager.Instance.stop(AudioClipsEnum.Mini_Expectation);

        switch (winType) {
            case MiniGameSymbol.Grand:
                AudioManager.Instance.play(AudioClipsEnum.MiniHit04);
                break;
            case MiniGameSymbol.Major:
                AudioManager.Instance.play(AudioClipsEnum.MiniHit03);
                break;
            case MiniGameSymbol.Minor:
                AudioManager.Instance.play(AudioClipsEnum.MiniHit02);
                break;
            case MiniGameSymbol.Mini:
                AudioManager.Instance.play(AudioClipsEnum.MiniHit01);

                break;
        }
    }

    public getMaxWinType(): number {
        const self = this;
        let cnt = 0;
        let cntThreshold = 3;
        cnt = self.grandCnt;
        if (cnt == cntThreshold) return MiniGameSymbol.Grand;
        cnt = self.majorCnt;
        if (cnt == cntThreshold) return MiniGameSymbol.Major;
        cnt = self.minorCnt;
        if (cnt == cntThreshold) return MiniGameSymbol.Minor;
        cnt = self.miniCnt;
        if (cnt == cntThreshold) return MiniGameSymbol.Mini;
    }

    /** TODO play game end sound */
    private playMiniGameEndSound() {
        const self = this;
        let lang = self.gameDataProxy.language;

        switch (lang) {
            case 'zh':
                AudioManager.Instance.play(AudioClipsEnum.JPResult_zh);
                break;
            default:
                AudioManager.Instance.play(AudioClipsEnum.JPResult_en);
                break;
        }
    }
    // 瞇牌效果
    private checkExpectationSymbol(resultID: number) {
        const self = this;
        switch (resultID) {
            case MiniGameSymbol.Grand:
                if (self.grandCnt == 2) {
                    self.view.expectationSymbol(resultID, this.openingSeqArr);
                    AudioManager.Instance.play(AudioClipsEnum.Mini_Expectation).loop(true);
                }
                break;
            case MiniGameSymbol.Major:
                if (self.majorCnt == 2) {
                    self.view.expectationSymbol(resultID, this.openingSeqArr);
                }
                break;
            case MiniGameSymbol.Minor:
                if (self.minorCnt == 2) {
                    self.view.expectationSymbol(resultID, this.openingSeqArr);
                }
                break;
            case MiniGameSymbol.Mini:
                if (self.miniCnt == 2) {
                    self.view.expectationSymbol(resultID, this.openingSeqArr);
                }
                break;
        }
    }

    // 倒數計時不使用 scheduleTimer，避免 turbo mode 計時被加速
    private registerAutoClickSymbolTimer() {
        const self = this;
        self.view.countdown.string = self.view.autoStartTime.toString();
        clearInterval(self.countdownTimerId);
        self.countdownTimerId = setInterval(() => {
            let curSeconds = parseInt(self.view.countdown.string) - 1;
            self.view.countdown.string = String(curSeconds);
            if (self.view.countdown.string == '0') {
                self.isAutoClick = true;
                self.view.enableCountdown(false);
                clearInterval(self.countdownTimerId);
                self.countdownTimerId = null;
            }
        }, 1000);

        clearTimeout(self.autoStartTimerId);
        self.autoStartTimerId = setTimeout(() => {
            self.autoClickSymbol();
            self.autoStartTimerId = null;
        }, (self.view.autoStartTime + self.view.countdownLastTime) * 1000);
    }

    private autoClickSymbol() {
        const self = this;
        let buttonList = self.view.getAllSymbolButton();
        GlobalTimer.getInstance().removeTimer(this.autoClickTimerKey);
        GlobalTimer.getInstance()
            .registerTimer(
                this.autoClickTimerKey,
                0.1,
                () => {
                    if (self.miniResultData.length > 0) {
                        let buttonIndex = self.symbolClickState[Formula.getRndInt(self.symbolClickState.length)];
                        if (self.view.clickData.has(buttonList[buttonIndex].node.name) == false) {
                            self.onClickSymbol(buttonList[buttonIndex].node, buttonIndex);
                        }
                    } else {
                        GlobalTimer.getInstance().removeTimer(this.autoClickTimerKey);
                    }
                },
                this,
                macro.REPEAT_FOREVER
            )
            .start();
    }
}
