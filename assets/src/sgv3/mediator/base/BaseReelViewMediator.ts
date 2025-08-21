import { _decorator } from 'cc';
import { DEBUG } from 'cc/env';
import BaseMediator from '../../../base/BaseMediator';
import { StateMachineCommand } from '../../../core/command/StateMachineCommand';
import { StateMachineObject } from '../../../core/proxy/CoreStateMachineProxy';
import { ReelEffect_SymbolFeatureCommand } from '../../../game/command/reelEffect/ReelEffect_SymbolFeatureCommand';
import { GAME_GameDataProxy } from '../../../game/proxy/GAME_GameDataProxy';
import { AudioClipsEnum } from '../../../game/vo/enum/SoundMap';
import { AudioManager } from '../../../audio/AudioManager';
import { CheckScreenSymbolCommand } from '../../command/nomatch/CheckScreenSymbolCommand';
import { ReelEffectCommand } from '../../command/reeleffect/ReelEffectCommand';
import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';
import {
    ScreenEvent,
    ReelEvent,
    SpinResultProxyEvent,
    ReelDataProxyEvent,
    WebGameState,
    WinEvent
} from '../../util/Constant';
import { ReelView } from '../../view/reel/ReelView';
import { GameScene } from '../../vo/data/GameScene';
import { ReelState } from '../../vo/data/ReelState';
import { WheelData } from '../../vo/data/WheelData';
import { ReelPasser, StripIndexer } from '../../vo/match/ReelMatchInfo';
import { CommonGameResult } from '../../vo/result/CommonGameResult';
import { GameStateSetting } from '../../vo/setting/GameStateSetting';

const { ccclass } = _decorator;
/** 基礎Reel功能判定實作 */
@ccclass('BaseReelViewMediator')
export class BaseReelViewMediator<T extends ReelView> extends BaseMediator<T> {
    protected stateSetting: GameStateSetting;
    protected reelView: T;
    /** key SequenceIndex value 為尚未Callback reel數*/
    protected keyPool: { [key: number]: number } = {};
    /** 滾停順序,Index為順序,value為ReelIndex */
    protected spinStopSequence: Array<number[]>;

    protected isTriggerEmergencyStop: boolean = false;
    protected isTriggerErrorStop: boolean = false;
    protected enableEmergencyStop: boolean = false;
    protected currentSequenceIndex: number = 0;
    protected performFinishedNum: number = 0;

    protected lazyEventListener(): void {}

    /** 初始化ReelViewMediator基本設定 */
    protected initReelViewMediator(): void {
        const self = this;
        // 根據場景取得場景狀態基本資料
        self.reelView.mySceneName = self.gameDataProxy.curScene;
        // 設定初始化後，設定reelState為idle
        self.reelDataProxy.reelState = ReelState.Idle;
        //開啟急停功能.
        self.enableEmergencyStop = true;
    }

    /**TO DO: 資料初始化Reel狀態 */
    protected initReelStatus(): void {
        const self = this;
        let sceneData = self.gameDataProxy.getSceneDataByName(self.reelView.mySceneName);
        let reelTable: WheelData[] = null;
        reelTable = self.stateSetting.wheelData[self.gameDataProxy.sceneSetting.defaultMathTableIndex];
        // 初始化reelView UI基本設定
        self.reelView.onSceneChange();
        self.reelView.setReelPrefab(sceneData.reelPrefab);
        self.reelView.reelsInit(reelTable.length, this.spinStopSequence, this._gameDataProxy.language);
        let rollingStrip = new Array<Array<number>>();
        for (let i = 0; i < reelTable.length; i++) {
            rollingStrip.push(reelTable[i].wheelData.concat());
            self.reelView.setStrip(i, reelTable[i].wheelData);
            self.reelView.setTargetRng(i, 0);
        }
        self.reelDataProxy.setRollingStrip(self.reelView.mySceneName, rollingStrip);

        for (let i = 0; i < self.spinStopSequence.length; i++) {
            self.keyPool[i] = self.spinStopSequence[i].length;
        }
        self.reelView.reelsShow();
    }

    protected registerReelStopEvent(): void {
        const self = this;
        for (let i in self.reelView.reelsList) {
            self.reelView.reelsList[i].singleReelContent.onSingleReelStop = (val: number) => self.onSingleReelStop(val);
            self.reelView.reelsList[i].singleReelContent.onSymbolsResultCheck = (val: StripIndexer) =>
                self.onSymbolsResultCheck(val);
        }
    }

    protected baseListNotificationInterests(): Array<string> {
        return [
            ScreenEvent.ON_SPIN_DOWN,
            SpinResultProxyEvent.RESPONSE_SPIN,
            ReelDataProxyEvent.ON_STRIP_CHANGE,
            ReelEvent.ON_REELS_START_ROLL,
            ReelEvent.ON_REELS_PERFORM_END,
            ReelEvent.ON_REEL_EFFECT_COMPLETE,
            ReelEvent.ON_REELS_INIT,
            ReelEvent.ON_REELS_RESTORE,
            ReelEvent.ON_SINGLE_REEL_STOP_ERROR,
            ReelEvent.ON_REELS_RESET,
            ReelEvent.SHOW_LAST_SYMBOL_OF_REELS
        ];
    }

    protected baseHandleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        const self = this;
        switch (name) {
            case ScreenEvent.ON_SPIN_DOWN:
                self.onBaseSpinDown();
                break;
            case SpinResultProxyEvent.RESPONSE_SPIN:
                self.onGetRNG();
                break;
            case ReelDataProxyEvent.ON_STRIP_CHANGE:
                self.updateStrip();
                break;
            case ReelEvent.ON_REELS_START_ROLL:
                self.onReelsStartRoll();
                break;
            case ReelEvent.ON_REELS_PERFORM_END:
                self.onReelsRollComplete();
                break;
            case ReelEvent.ON_REEL_EFFECT_COMPLETE:
                self.stopReel();
                break;
            case ReelEvent.ON_REELS_INIT:
                self.reelView.mySceneName = self.gameDataProxy.curScene;
                self.onReelsInit();
                break;
            case ReelEvent.ON_REELS_RESTORE:
                self.onRNGRestore(notification.getBody());
                break;
            case ReelEvent.ON_SINGLE_REEL_STOP_ERROR:
                self.onTriggerSymbolsError(notification.getBody());
                break;
            case ReelEvent.ON_REELS_RESET:
                let reelTable: WheelData[] = null;
                reelTable = self.stateSetting.wheelData[self.gameDataProxy.sceneSetting.defaultMathTableIndex];
                self.onChangReelPasser(
                    reelTable.length,
                    notification.getBody().sceneName,
                    notification.getBody().reelPasser
                );
                break;
        }
    }

    protected onReelsInit() {
        const self = this;
        if (!self.reelView.node.active) {
            self.reelView.node.active = true;
        }
        if (self.reelView.mySceneName == GameScene.Init) {
            self.reelView.mySceneName = GameScene.Game_1;
        }
        self.stateSetting = self.gameDataProxy.getStateSettingByName(self.reelView.mySceneName);
        self.spinStopSequence = self.gameDataProxy.getSceneDataByName(self.reelView.mySceneName).reelSpinStopSequence;
        // 初始化reel狀態
        self.initReelStatus();
        self.registerReelStopEvent();
    }

    /** 一般Spin */
    protected onBaseSpinDown(): void {
        const self = this;
        // JP 狀態，嘗試關閉
        if (self.gameDataProxy.onHitJackpot) {
            self.sendNotification(WinEvent.HIDE_BOARD_REQUEST);
            return;
        }
        switch (self.reelDataProxy.reelState) {
            case ReelState.Idle:
                if (self.gameDataProxy.checkReelCanSpin()) {
                    switch (self.gameDataProxy.curScene) {
                        case GameScene.Game_1:
                            self.sendNotification(
                                StateMachineCommand.NAME,
                                new StateMachineObject(StateMachineProxy.GAME1_SPIN)
                            );
                            self.webBridgeProxy.sendGameState(WebBridgeProxy.curScene, WebGameState.SPIN);
                            self.reelDataProxy.reelState = ReelState.WaitRNG;
                            break;
                        case GameScene.Game_2:
                            self.sendNotification(
                                StateMachineCommand.NAME,
                                new StateMachineObject(StateMachineProxy.GAME2_SPIN)
                            );
                            break;
                        case GameScene.Game_4:
                            self.sendNotification(
                                StateMachineCommand.NAME,
                                new StateMachineObject(StateMachineProxy.GAME4_SPIN)
                            );
                            break;
                    }
                    if (!self.gameDataProxy.onAutoPlay && self.gameDataProxy.curScene == GameScene.Game_1) {
                        AudioManager.Instance.play(AudioClipsEnum.Button_Spin);
                    }
                    self.onSpin();
                }
                break;
            case ReelState.CanStop:
                if (self.enableEmergencyStop || DEBUG) {
                    self.onReelsEmergencyStop();
                    //if (self.gameDataProxy.curScene != GameScene.Game_1 && !self.gameDataProxy.onAutoPlay) {
                    //AudioManager.Instance.playAudio(AudioClipsEnum.Button_Spin);
                    //}
                }
                break;
        }
    }

    /** 所有Reel開始滾動 */
    protected onReelsStartRoll(): void {
        const self = this;
        self.currentSequenceIndex = 0;
        self.performFinishedNum = 0;
        self.isTriggerEmergencyStop = false;
        self.reelView.reelsRollStart();
    }

    /** 指定滾停序列開始滾停 並通知開始滾停 */
    protected onSingleReelStartStop(): void {
        const self = this;
        if (self.currentSequenceIndex < self.spinStopSequence.length && !self.isTriggerEmergencyStop) {
            if (self.reelDataProxy.isSlowMotionAry[self.currentSequenceIndex]) {
                let singleReelContent = self.reelView.reelsList[self.currentSequenceIndex].singleReelContent;
                self.sendNotification(ReelEvent.ON_SINGLE_REEL_START_STOP, singleReelContent);
                self.reelView.reelSlowStop(self.spinStopSequence[self.currentSequenceIndex]);
            } else {
                self.reelView.reelStop(self.spinStopSequence[self.currentSequenceIndex]);
            }
        }
    }

    /** 指定序列Reel做Damping */
    protected onSingleReelStop(reelIndex: number): void {
        const self = this;
        if (self.isTriggerErrorStop) {
            return;
        }
        self.reelView.reelDamp(reelIndex, () => self.onReelDampingEnd());
        self.onCallBack(self.currentSequenceIndex, () => self.onReelStopEnd());
    }

    /** 單一Reel滾停結束 事件通知 */
    protected onReelStopEnd(): void {
        const self = this;
        if (self.isTriggerErrorStop) {
            return;
        }
        if (!self.isTriggerEmergencyStop) {
            self.handleSlowMotion();
        }
        self.sendNotification(ReelEvent.ON_SINGLE_REEL_START_DAMPING, self.currentSequenceIndex);
        self.currentSequenceIndex++;
        self.onSingleReelStartStop();
    }

    protected handleSlowMotion() {
        let self = this;
        if (self.reelDataProxy.isSlowMotionAry[self.currentSequenceIndex]) {
            self.sendNotification(ReelEvent.ON_SINGLE_REEL_STOP_END, {
                fovLength: self.reelView.reelsList[self.currentSequenceIndex].singleReelContent.stripIndexer.fovLength,
                isHit: self.handleSlowMotionHit()
            });
        }
    }

    protected handleSlowMotionHit() {}

    /** 單一ReelDamping 結束 與所有Reel滾停 事件通知 */
    protected onReelDampingEnd(): void {
        const self = this;
        self.performFinishedNum++;
        if (self.performFinishedNum >= self.reelView.reelsList.length && !self.isTriggerErrorStop) {
            self.reelDataProxy.reelState = ReelState.Idle;
            self.sendNotification(ReelEvent.ON_REELS_PERFORM_END);
        }
    }

    /** 所有滾輪結束滾停表演時 */
    protected onReelsRollComplete(): void {
        switch (this.gameDataProxy.curScene) {
            case GameScene.Game_1:
                this.sendNotification(
                    StateMachineCommand.NAME,
                    new StateMachineObject(StateMachineProxy.GAME1_ROLLCOMPLETE)
                );
                break;
            case GameScene.Game_2:
                this.sendNotification(
                    StateMachineCommand.NAME,
                    new StateMachineObject(StateMachineProxy.GAME2_ROLLCOMPLETE)
                );
                break;
            case GameScene.Game_4:
                this.sendNotification(
                    StateMachineCommand.NAME,
                    new StateMachineObject(StateMachineProxy.GAME4_ROLLCOMPLETE)
                );
                break;
        }
        this.webBridgeProxy.sendGameState(WebBridgeProxy.curScene, WebGameState.ROLLCOMPLETE);
    }

    //收到credit判斷可以進行spin,才開始滾動reel
    protected onSpin(): void {
        const self = this;
        //滾動 strip 替換
        self.updateStrip();
        //送出Reel spinning事件通知其他組件
        self.sendNotification(ReelEvent.ON_REELS_START_ROLL);
    }

    /** Spin 後，onGetRNG 在 set mathTableIndex 值時，會刷新一次 */
    protected updateStrip(): void {
        const self = this;
        for (let i = 0; i < self.reelDataProxy.rollingStrip.length; i++) {
            self.reelView.setStrip(i, self.reelDataProxy.rollingStrip[i]);
        }
    }

    /** 觸發即停 */
    protected onReelsEmergencyStop(): void {
        const self = this;
        self.isTriggerEmergencyStop = true;
        self.reelView.reelsEmergencyStop();
        self.handleSlowMotion();
        //送出Reel spinning事件通知其他組件
        self.sendNotification(ReelEvent.ON_REELS_EMERGENCY_STOP);
    }

    /** 觸發spin down */
    protected onClickBtn(): void {
        this.sendNotification(ScreenEvent.ON_SPIN_DOWN);
    }

    /** SPIN 後取得數學資料 */
    protected onGetRNG(): void {
        const self = this;
        self.reelDataProxy.mathTableIndex = self.gameDataProxy.curRoundResult.usedTableIndex;
        self.sendNotification(ReelDataProxyEvent.ON_STRIP_CHANGE);
        for (let infoIndex = 0; infoIndex < self.gameDataProxy.curRoundResult.displayInfo.rngInfo.length; infoIndex++) {
            let rngInfo: Array<number> = self.gameDataProxy.curRoundResult.displayInfo.rngInfo[infoIndex];
            for (let i = 0; i < rngInfo.length; i++) {
                self.reelView.setTargetRng(infoIndex * rngInfo.length + i, rngInfo[i]);
            }
        }
        self.reelDataProxy.reelState = ReelState.WaitEffectComplete;
        //讓外部去處理後續Reel模組所需資料
        self.sendNotification(ReelEffectCommand.NAME);
    }

    protected stopReel() {
        if (this.reelDataProxy.reelState == ReelState.WaitEffectComplete) {
            this.reelView.reelsRollAfter(() => this.onCallBack(0, () => this.onSingleReelStartStop()));
            this.reelDataProxy.reelState = ReelState.CanStop;
            if (
                this.reelDataProxy.isQuickSpin &&
                this.gameDataProxy.curRoundResult.displayInfo.prizePredictionType != 'TYPE_1'
            )
                this.onReelsEmergencyStop();
        }
    }

    protected onCallBack(sequenceIndex: number, callBack: Function | null = null) {
        this.keyPool[sequenceIndex]--;
        if (this.keyPool[sequenceIndex] <= 0 && callBack != null) {
            callBack();
            this.keyPool[sequenceIndex] = this.spinStopSequence[sequenceIndex].length;
        }
    }

    /** 有 Recovery Data 要先還原 RNG */
    protected onRNGRestore(roundResult: CommonGameResult) {
        const self = this;
        if (self.reelView.reelsList.length == 0) {
            return;
        }
        self.reelDataProxy.mathTableIndex = roundResult.usedTableIndex;
        self.sendNotification(ReelDataProxyEvent.ON_STRIP_CHANGE);
        for (let infoIndex = 0; infoIndex < roundResult.displayInfo.rngInfo.length; infoIndex++) {
            let rngInfo: Array<number> = roundResult.displayInfo.rngInfo[infoIndex];
            for (let i = 0; i < rngInfo.length; i++) {
                self.reelView.setTargetRng(infoIndex * rngInfo.length + i, rngInfo[i]);
            }
        }
        this.reelDataProxy.reelState = ReelState.Idle;
        //讓外部去處理後續Reel模組所需資料
        self.sendNotification(ReelEffect_SymbolFeatureCommand.NAME);
    }

    protected onSymbolsResultCheck(reelInfo: StripIndexer) {
        const self = this;
        //讓外部去確認後續 Reel 資料是否顯示錯誤
        self.sendNotification(CheckScreenSymbolCommand.NAME, reelInfo);
    }

    protected onTriggerSymbolsError(reelIndex: number) {
        const self = this;
        self.isTriggerErrorStop = true;
        self.reelView.reelRollStart(reelIndex);
    }
    protected onChangReelPasser(count: number, sceneName: string, reelPasser: ReelPasser) {
        const self = this;
        self.reelView.changReelPasser(count, sceneName, reelPasser);
    }
    // ======================== Get Set ========================
    protected _gameDataProxy: GAME_GameDataProxy;
    protected get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }

    protected _webBridgeProxy: WebBridgeProxy;
    protected get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }
}
