import { Vec2, Node, _decorator } from 'cc';
import { ScoringHandleCommand } from '../../sgv3/command/byGame/ScoringHandleCommand';
import { BaseReelViewMediator } from '../../sgv3/mediator/base/BaseReelViewMediator';
import { ReelDataProxy } from '../../sgv3/proxy/ReelDataProxy';
import { StateMachineProxy } from '../../sgv3/proxy/StateMachineProxy';

import {
    DragonUpEvent,
    FreeGameEvent,
    ReelEvent,
    ScreenEvent,
    SpinResultProxyEvent,
    ViewMediatorEvent,
    WinEvent
} from '../../sgv3/util/Constant';
import { SingleReelContent } from '../../sgv3/view/reel/single-reel/SingleReelContent';
import { GameScene, GameSceneOption } from '../../sgv3/vo/data/GameScene';
import { ReelType, SymbolId, SymbolPerformType } from '../../sgv3/vo/enum/Reel';
import { SpecialHitInfo } from '../../sgv3/vo/enum/SpecialHitInfo';
import { SymbolInfo } from '../../sgv3/vo/info/SymbolInfo';
import { FreeGameOneRoundResult } from '../../sgv3/vo/result/FreeGameOneRoundResult';
import { TopUpGameOneRoundResult } from '../../sgv3/vo/result/TopUpGameOneRoundResult';
import { WAY_AllWinData } from '../../sgv3way/vo/datas/WAY_AllWinData';
import { AudioManager } from '../../audio/AudioManager';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { GAME_ReelView } from '../view/GAME_ReelView';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
import { GlobalTimer } from '../../sgv3/util/GlobalTimer';
import { MathUtil } from 'src/core/utils/MathUtil';
import { SeatInfo } from 'src/sgv3/vo/result/ExtendInfoForBaseGameResult';
import { WinType } from 'src/sgv3/vo/enum/WinType';
import { BalanceUtil } from 'src/sgv3/util/BalanceUtil';
import { UIEvent } from 'common-ui/proxy/UIEvent';
import { AfterReconnectionCommand } from 'src/sgv3/command/connect/AfterReconnectionCommand';

const { ccclass } = _decorator;
/** ByGame Win Reel判定實作 */
@ccclass('ReelViewMediator')
export class ReelViewMediator extends BaseReelViewMediator<GAME_ReelView> {
    public static readonly NAME: string = 'ReelViewMediator';

    protected reelView: GAME_ReelView | null = null;
    protected winData: WAY_AllWinData | null = null;

    protected curIndex: number = 0;
    protected isPlayedWildScoring: boolean = false;
    protected preSpinStopSoundSequence: Array<string> = [];

    protected isHideC1AndC2: boolean = false;

    public constructor(name?: string, component?: any) {
        super(name, component);
        this.reelView = this.viewComponent as GAME_ReelView;
    }

    protected lazyEventListener(): void {
        this.initReelViewMediator();
    }

    public listNotificationInterests(): Array<string> {
        return Array.from(
            new Set(
                [
                    ReelEvent.ON_REELS_INIT,
                    ReelEvent.SHOW_HOLD_SPIN_WIN,
                    ReelEvent.ON_SINGLE_REEL_START_DAMPING,
                    ScreenEvent.ON_SPIN_DOWN,
                    SpinResultProxyEvent.RESPONSE_SPIN,
                    ReelEvent.SHOW_ALL_REELS_WIN,
                    ReelEvent.SHOW_REELS_WIN,
                    WinEvent.FORCE_WIN_DISPOSE,
                    ScreenEvent.ON_BET_CHANGE,
                    DragonUpEvent.ON_MULTIPLE_ACCUMULATE_START,
                    DragonUpEvent.ON_BASE_CREDIT_COLLECT_END,
                    DragonUpEvent.ON_BASE_CREDIT_COLLECT_START,
                    DragonUpEvent.ON_GET_MULTIPLE_RESULT_END,
                    DragonUpEvent.ON_RESPIN_NEXT_START,
                    WinEvent.ON_HIT_SPECIAL,
                    FreeGameEvent.ON_SIDE_BALL_SHOW_AFTER,
                    FreeGameEvent.ON_EXPAND_WILD,
                    ReelEvent.ON_REELS_RESTORE,
                    ReelEvent.HIDE_WILD_SYMBOL,
                    ReelEvent.SHOW_LAST_SYMBOL_OF_REELS,
                    ReelEvent.ON_HIDE_C1_AND_C2,
                    UIEvent.UPDATE_TOTAL_BET,
                    AfterReconnectionCommand.NAME,
                    ViewMediatorEvent.BEFORE_COLLECT_BALL
                ].concat(super.baseListNotificationInterests())
            )
        );
    }

    public handleNotification(notification: puremvc.INotification): void {
        super.baseHandleNotification(notification);
        let name = notification.getName();
        switch (name) {
            case ReelEvent.ON_REELS_INIT:
                this.ReelContentInit();
                this.createProxySymbolsNodeData();
                break;
            case FreeGameEvent.ON_EXPAND_WILD:
                this.setRespinInfo(notification.getBody());
                break;
            case ReelEvent.ON_SINGLE_REEL_START_DAMPING:
                this.playReelStopSound(notification.getBody());
                break;
            case SpinResultProxyEvent.RESPONSE_SPIN:
                this.setSymbolPosData();
                break;
            case ReelEvent.SHOW_ALL_REELS_WIN:
                this.ShowAllReelsWin(notification.getBody());
                break;
            case ReelEvent.SHOW_REELS_WIN:
                this.ShowReelsWin(notification.getBody());
                break;
            case ReelEvent.SHOW_HOLD_SPIN_WIN:
                this.showHoldSpinWin(notification.getBody());
                break;
            case ScreenEvent.ON_BET_CHANGE:
                this.ReelContentInit();
                break;
            case WinEvent.FORCE_WIN_DISPOSE:
                this.skipLoopWin();
                this.view.reelsShow();
                break;
            case DragonUpEvent.ON_MULTIPLE_ACCUMULATE_START:
                this.onMultipleAccumulate(notification.getBody());
                break;
            case DragonUpEvent.ON_BASE_CREDIT_COLLECT_START:
                this.baseCreditUpdate(notification.getBody());
                break;
            case DragonUpEvent.ON_BASE_CREDIT_COLLECT_END:
                this.targertCreditUpdate(notification.getBody());
                break;
            case DragonUpEvent.ON_GET_MULTIPLE_RESULT_END:
                this.getCreditResult(notification.getBody());
                break;
            case DragonUpEvent.ON_RESPIN_NEXT_START:
                this.onReSpinNext(notification.getBody());
                break;
            case FreeGameEvent.ON_SIDE_BALL_SHOW_AFTER:
                if (this.gameDataProxy.curScene == GameScene.Game_2) {
                    this.view.freeGameHideSideBall();
                }
                break;
            case ReelEvent.SHOW_LAST_SYMBOL_OF_REELS:
                this.showLastSymbolOfReels(notification.getBody());
            case ReelEvent.ON_REELS_RESTORE:
                this.setSymbolPosData();
                this.reelView.reelsShow();
                break;
            case ReelEvent.HIDE_WILD_SYMBOL:
                this.hideWildSymbol();
                break;
            case ScreenEvent.ON_SPIN_DOWN:
                break;
            case ReelEvent.ON_HIDE_C1_AND_C2:
                this.isHideC1AndC2 = !this.isHideC1AndC2;
                this.reelView.hideC1AndC2Symbol(this.isHideC1AndC2);
                for (let i = 0; i < this.reelView.reelsList.length; i++) {
                    this.reelView.reelsList[i].singleReelContent.isHideC1AndC2 = this.isHideC1AndC2;
                }
                break;
            case UIEvent.UPDATE_TOTAL_BET:
            case AfterReconnectionCommand.NAME:
                this.changeWheelData();
                break;
            case ViewMediatorEvent.BEFORE_COLLECT_BALL:
                this.playBeforeCollectBallAnimation();
                break;
        }
    }

    protected onBaseSpinDown(): void {
        super.onBaseSpinDown();

        if (this.gameDataProxy.showWinOnceComplete) {
            this.skipShowAllWin();
        }
    }

    protected changeWheelData() {
        // 修改每個場景的 wheelData
        if (this.gameDataProxy.isOmniChannel()) {
            let featureIdx = this.gameDataProxy.curFeatureIdx;
            if (featureIdx >= 0) {
                let gameSceneList = Object.entries(GameSceneOption);
                for (let i = 2; i < gameSceneList.length; i++) {
                    let GameStateSetting = this.gameDataProxy.getStateSettingByName(GameSceneOption[i]);
                    if (GameStateSetting != undefined) {
                        GameStateSetting.setWheelData(featureIdx);
                    }
                }
            }
            if (this.gameDataProxy.curScene == GameScene.Game_1) {
                this.reelDataProxy.mathTableIndex = 0;
            }
        }
    }

    private skipShowAllWin() {
        if (
            this.gameDataProxy.gameState == StateMachineProxy.GAME1_SHOWWIN ||
            this.gameDataProxy.gameState == StateMachineProxy.GAME2_SHOWWIN
        ) {
            if (this.gameDataProxy.curRoundResult.displayInfo.winType < WinType.bigWin) {
                this.gameDataProxy.curRoundResult.displayInfo.scoringTime = 0;
            }
            for (let y in this.winData.wayInfos) {
                if (this.winData.wayInfos[y].symbolId < 0) {
                    continue;
                }
                for (let i in this.winData.wayInfos[y].symbols) {
                    let symbol: SymbolInfo = this.winData.wayInfos[y].symbols[i];
                    if (symbol.sid >= 0) {
                        this.reelView.skipShowAllWinSymbol(symbol);
                    }
                }
            }
        }
    }

    protected registerReelStopEvent(): void {
        super.registerReelStopEvent();
        const self = this;
        if (self.view.mySceneName != GameScene.Game_4) {
            return;
        }

        for (let i in this.reelView.reelsList) {
            this.reelView.reelsList[i].singleReelContent.onSingleReelDampingEnd = (val: number) =>
                self.onSingleReelDampingEnd(val);
        }
    }

    protected onSingleReelStop(reelIndex: number): void {
        super.onSingleReelStop(reelIndex);
        if (this.view.mySceneName != GameScene.Game_2 || !this.reelDataProxy.isSlowMotionAry[3] || reelIndex != 2) {
            return;
        }

        for (let j = 1; j <= 3; j++) {
            let content = this.reelView.reelsList[j].singleReelContent as SingleReelContent;
            content.isBlackSymbol = true;
            if (j != 3) {
                this.reelView.reelsList[j].play(ReelType.BLACK_SHOW);
            }
        }

        this.view.setReelWinMask(true);
    }

    protected onSingleReelDampingEnd(reelIndex: number) {
        let sidx = reelIndex % 5;
        let sidy = Math.floor(reelIndex / 5);
        let symbolInfo = new SymbolInfo();
        symbolInfo.sid = SymbolId.C2;
        symbolInfo.x = sidx;
        symbolInfo.y = sidy;
        this.reelView.createAnimSymbol(symbolInfo);
        this.reelView.setHoldSpinSymbol(symbolInfo, this.reelDataProxy.symbolFeature[sidx][sidy]);
    }

    protected playReelStopSound(curReelStopIndex: number) {
        for (let i = 0; i < this.reelDataProxy.reelStopSoundSequence[curReelStopIndex].length; i++) {
            const stopSound: AudioClipsEnum = this.reelDataProxy.reelStopSoundSequence[curReelStopIndex][i];
            const preStopSound = this.preSpinStopSoundSequence[curReelStopIndex];
            if (preStopSound == AudioClipsEnum.SpinStop) {
                AudioManager.Instance.stop(this.preSpinStopSoundSequence[curReelStopIndex], true);
            }
            AudioManager.Instance.play(stopSound);
            this.preSpinStopSoundSequence[curReelStopIndex] = stopSound;
        }
        this.reelDataProxy.reelStopSoundSequence[curReelStopIndex] = [];
    }

    protected setRespinInfo(nexRoundResult: FreeGameOneRoundResult) {
        let respinWinData = nexRoundResult.extendInfoForFreeGameResult.reSpinResult.waysResult;
        for (let i = 0; i < this.reelView.reelsList.length; i++) {
            let content = this.reelView.reelsList[i].singleReelContent as SingleReelContent;
            if (i >= 1 && i <= 3) {
                for (let j = 0; j < respinWinData.length; j++) {
                    content.respinSymbolId.push(respinWinData[j].symbolID);
                }
            }
            // ByGame Featrue
            if (i == 0 || i == 4) {
                content.isTriggerFeatureReSpin = true;
            }
            content.freeCreditWeight = [0];
        }
    }

    protected onReSpinNext(infoArray: Array<any>) {
        let symbolInfo: SymbolInfo = new SymbolInfo();
        symbolInfo.sid = SymbolId.SUB;
        symbolInfo.x = infoArray[0].x;
        symbolInfo.y = infoArray[0].y;
        this.reelView.dragonUpReSpinPerform(
            symbolInfo,
            this.reelDataProxy.symbolFeature[infoArray[0].x][infoArray[0].y],
            () => this.onReSpinNextEnd(infoArray)
        );
        //播放加場次音效
        AudioManager.Instance.play(AudioClipsEnum.DragonUp_RetriggerCollect);
    }

    protected onReSpinNextEnd(infoArray: Array<any>) {
        infoArray[0] = this.reelDataProxy.symbolFeature[infoArray[0].x][infoArray[0].y].ReSpinNum;
        this.sendNotification(DragonUpEvent.ON_RESPIN_NEXT_END, infoArray);
    }

    protected onMultipleAccumulate(targertSequence: Vec2) {
        let reelIndex = this.spinStopSequence[targertSequence.x][targertSequence.y];
        this.reelView.dragonUpMultipleAccumulate(reelIndex);
    }

    protected targertCreditUpdate(data: { reelIndex: number; credit: string }) {
        this.reelView.dragonUpTargertCreditUpdate(data.reelIndex, data.credit);
    }

    protected getCreditResult(data: { reelIndex: number; credit: string }) {
        this.reelView.dragonUpGetCreditResult(data.reelIndex, data.credit);
    }

    protected baseCreditUpdate(reelIndex: number) {
        this.reelView.dragonUpBaseCreditUpdate(reelIndex);
    }

    protected ReelContentInit() {
        switch (this.view.mySceneName) {
            case GameScene.Game_1:
                for (let i = 0; i < this.reelView.reelsList.length; i++) {
                    this.reelDataProxy.reelsPos[i] = this.reelView.reelsList[i].node.position;
                    let content = this.reelView.reelsList[i].singleReelContent as SingleReelContent;
                    let baseExtendSetting =
                        this.gameDataProxy.initEventData.executeSetting.baseGameSetting.baseGameExtendSetting;
                    content.creditArray = this.getCreditArray(baseExtendSetting.creditBall);
                    const creditWeight = this.gameDataProxy.isOmniChannel()
                        ? baseExtendSetting.groupingCreditBallWeight[this.gameDataProxy.curFeatureIdx]
                        : baseExtendSetting.creditBallWeight[0];
                    content.creditWeight = this.getWeight(creditWeight);
                    content.specialBallCredit = this.getSpecialBallCredit(content.creditArray, creditWeight);
                    content.isOmniChannel = this.gameDataProxy.isOmniChannel();
                }
                break;
            case GameScene.Game_2:
                let c1DisplayWeight: Array<Array<number>> =
                    this.gameDataProxy.initEventData.executeSetting.freeGameSetting.freeGameExtendSetting
                        .c1DisplayWeight;
                let freeGameType =
                    this.gameDataProxy.spinEventData.freeGameResult.freeGameOneRoundResult[0].specialHitInfo;
                if (freeGameType == null) freeGameType = 'freeGame_03';
                for (let i = 0; i < this.reelView.reelsList.length; i++) {
                    let content = this.reelView.reelsList[i].singleReelContent as SingleReelContent;
                    content.freeCreditWeight = c1DisplayWeight[SpecialHitInfo[freeGameType] - 1];
                    content.isTriggerFeatureReSpin = false;
                }
                break;
            case GameScene.Game_4:
                for (let i = 0; i < this.reelView.reelsList.length; i++) {
                    let content = this.reelView.reelsList[i].singleReelContent as SingleReelContent;
                    let topUpextendSetting =
                        this.gameDataProxy.initEventData.executeSetting.topUpGameSetting.topUpGameExtendSetting;
                    content.multipleArray = topUpextendSetting.ballRateHit;
                    if (this.gameDataProxy.isOmniChannel()) {
                        content.multipleWeight = this.getWeight(
                            content.multipleWeightByFeature[this.gameDataProxy.curFeatureIdx].multipleWeight
                        );
                    } else {
                        content.multipleWeight = this.getWeight(
                            topUpextendSetting.ballRateHitWeight[
                                this.gameDataProxy.spinEventData.baseGameResult.extendInfoForbaseGameResult.ballCount -
                                    6
                            ]
                        );
                    }

                    content.addRoundArray = topUpextendSetting.addRoundPerHit;
                }
                this.setSymbolPosData();
                break;
        }
    }

    /** 取得SymbolFOV資料 */
    protected setSymbolPosData() {
        if (this.reelView.reelsList.length == 0 || this.reelDataProxy.symbolFeature == null) {
            return;
        }
        switch (this.gameDataProxy.curScene) {
            case GameScene.Game_1:
                for (let i = 0; i < this.reelDataProxy.symbolFeature.length; i++) {
                    let reelContent = this.reelView.reelsList[i].singleReelContent as SingleReelContent;
                    reelContent.fovFeature = this.reelDataProxy.symbolFeature[i];
                }
                break;
            case GameScene.Game_2:
                for (let i = 0; i < this.reelDataProxy.symbolFeature.length; i++) {
                    let reelContent = this.reelView.reelsList[i].singleReelContent as SingleReelContent;
                    reelContent.fovFeature = this.reelDataProxy.symbolFeature[i];
                }
                break;
            case GameScene.Game_4:
                let topupOneRoundResult = this.gameDataProxy.curRoundResult as TopUpGameOneRoundResult;
                let isMaxReSpin =
                    topupOneRoundResult.extendInfoForTopUpGameResult.maxTriggerCountFlag &&
                    !topupOneRoundResult.extendInfoForTopUpGameResult.isRetrigger;
                for (let i = 0; i < this.reelDataProxy.symbolFeature.length; i++) {
                    for (let j = 0; j < this.reelDataProxy.symbolFeature[i].length; j++) {
                        let content = this.reelView.reelsList[this.reelDataProxy.symbolFeature.length * j + i]
                            .singleReelContent as SingleReelContent;
                        content.fovFeature[0] = this.reelDataProxy.symbolFeature[i][j].concat();
                        content.isMaxReSpin = isMaxReSpin;
                    }
                }
                break;
        }
    }

    protected showHoldSpinWin(winData: Array<SymbolInfo>) {
        let self = this;
        self.reelView.createAnimSymbols(winData);
        for (let i = 0; i < winData.length; i++) {
            self.reelView.setHoldSpinSymbol(winData[i], self.reelDataProxy.symbolFeature[winData[i].x][winData[i].y]);
        }
    }

    protected ShowAllReelsWin(WinData: WAY_AllWinData) {
        let self = this;
        self.winData = WinData.concat();
        self.curIndex = -1;
        self.reelView.createAnimSymbols(WinData.animationInfos);
        this.view.setReelWinMask(true);
        this.playAllLoopWin();
        this.reelView.checkNextLoopWin = () => self.checkNextWin();
        self.sendNotification(WinEvent.SHOW_WIN_ASSEMBLE_COMPLETE);
    }

    protected playAllLoopWin() {
        const self = this;
        self.isPlayedWildScoring = false;
        this.resetAllSymbols();
        for (let y in self.winData.wayInfos) {
            if (self.winData.wayInfos[y].symbolId < 0) {
                continue;
            }
            for (let i in self.winData.wayInfos[y].symbols) {
                let symbol: SymbolInfo = self.winData.wayInfos[y].symbols[i];
                if (symbol.sid >= 0) {
                    this.reelView.showAllWinSymbol(symbol);
                }
            }
        }
    }

    protected resetAllSymbols() {
        const self = this;
        let wayInfo = self.winData.wayInfos.find((wayInfo) => wayInfo.symbolId > 0);
        for (let i in wayInfo.symbols) {
            let symbol: SymbolInfo = wayInfo.symbols[i];
            this.reelView.setAnimSymbolHide(symbol);
        }
    }

    protected ShowReelsWin(WinData: WAY_AllWinData) {
        let self = this;
        self.winData = WinData.concat();
        self.curIndex = 0;
        self.reelView.createAnimSymbols(WinData.animationInfos);
        self.view.setReelWinMask(true);
        self.playLoopWin(self.curIndex);
        this.reelView.checkNextLoopWin = () => self.checkNextWin();
    }

    protected playLoopWin(wayInfoIndex: number) {
        const self = this;
        if (self.winData.wayInfos[wayInfoIndex].symbolId < 0) {
            return;
        }
        let symbolWin = self.winData.wayInfos[wayInfoIndex].symbolWin;
        if (symbolWin > 0) {
            let scoreDisplay: string = self.gameDataProxy.isOmniChannel()
                ? MathUtil.floor(self.gameDataProxy.getCreditByDenomMultiplier(symbolWin), 0).toString()
                : BalanceUtil.formatBalance(symbolWin);
            self.reelView.setWinScoreInfo(self.firstWinSymbol, scoreDisplay);
        }

        for (let i in self.winData.wayInfos[wayInfoIndex].symbols) {
            let symbol: SymbolInfo = self.winData.wayInfos[wayInfoIndex].symbols[i];
            if (symbol.sid >= 0) {
                if (symbol.sid == SymbolId.WILD && !self.isPlayedWildScoring) {
                    self.isPlayedWildScoring = true;
                }
                this.reelView.showLoopWinSymbol(symbol, self.reelDataProxy.symbolFeature[symbol.x][symbol.y]);
            } else {
                this.reelView.setAnimSymbolHide(symbol);
            }
        }
        self.sendNotification(ReelEvent.SHOW_REELS_LOOP_WIN, wayInfoIndex);
    }

    protected skipLoopWin() {
        let self = this;
        this.reelView.checkNextLoopWin = null;
        self.reelView.skipReelWin();
    }

    protected checkNextWin() {
        let self = this;
        if (self.reelView.isSymbolPlaying() == false) {
            if (this.gameDataProxy.showWinOnceComplete) {
                if (
                    this.gameDataProxy.gameState == StateMachineProxy.GAME1_SHOWWIN ||
                    this.gameDataProxy.gameState == StateMachineProxy.GAME2_SHOWWIN
                ) {
                    this.sendNotification(ScoringHandleCommand.NAME);
                    this.gameDataProxy.showWinOnceComplete = false;
                }
            }
            self.curIndex = self.curIndex + 1 >= self.winData.wayInfos.length ? 0 : this.curIndex + 1;
            self.playLoopWin(self.curIndex);
        }
    }

    protected createProxySymbolsNodeData() {
        let tempArray = new Array<Array<Node>>();
        for (let i = 0; i < this.reelView.reelsList.length; i++) {
            let array = new Array<Node>();
            let count = this.reelView.reelsList[i].singleReelContent.symbols.length;
            for (let j = 0; j < count; j++) {
                let symbol: Node = this.reelView.reelsList[i].singleReelContent.symbols[j].node;
                array.push(symbol);
            }
            tempArray.push(array);
        }
        this.reelDataProxy.setSymbolsNode(tempArray);
    }

    protected hideWildSymbol() {
        const self = this;
        let winData = self.gameDataProxy.curWinData.concat();
        for (let i in winData.wayInfos) {
            for (let j in winData.wayInfos[i].symbols) {
                let symbol: SymbolInfo = winData.wayInfos[i].symbols[j];
                if (symbol.sid == SymbolId.WILD) {
                    GlobalTimer.getInstance().removeTimer('delayHideWild');
                    GlobalTimer.getInstance()
                        .registerTimer(
                            'delayHideWild',
                            0.2,
                            () => {
                                this.view.hideWildSymbol(symbol);
                            },
                            this
                        )
                        .start();
                    return;
                }
            }
        }
    }
    // ======================== Get Set ========================
    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }

    protected _gameDataProxy: GAME_GameDataProxy;
    protected get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected get firstWinSymbol() {
        for (let i in this.winData.wayInfos[this.curIndex].symbols) {
            let symbol: SymbolInfo = this.winData.wayInfos[this.curIndex].symbols[i];
            if (symbol.sid >= 0) {
                return symbol;
            }
        }
        return null;
    }

    protected getWeight(array: Array<number>) {
        let temp = 0,
            range = Array<number>();
        range.push(temp);
        for (let i = 0; i < array.length; i++) {
            temp += array[i];
            range.push(temp);
        }
        return range;
    }

    protected getSpecialBallCredit(creditArray: Array<number>, weight: Array<number>) {
        let specialBallCredit = 0;
        for (let i = weight.length - 1; i >= 0; i--) {
            if (weight[i] > 0) {
                specialBallCredit = creditArray[i];
                break;
            }
        }
        return specialBallCredit;
    }

    protected getCreditArray(array: Array<number>) {
        let range = Array<number>();
        for (let i = 0; i < array.length; i++) {
            let display: number;
            if (this.gameDataProxy.isOmniChannel()) {
                display = MathUtil.mul(array[i], this.gameDataProxy.curBet);
            } else {
                let credit = MathUtil.div(
                    MathUtil.mul(array[i], this.gameDataProxy.curTotalBet, 10),
                    this.gameDataProxy.curDenom
                );
                display = this.gameDataProxy.convertCredit2Cash(credit);
            }
            range.push(display);
        }
        return range;
    }

    protected updateStrip(): void {
        if (this.gameDataProxy.curScene == GameScene.Game_1) {
            let replaceSymbolId =
                this.gameDataProxy.spinEventData?.baseGameResult.extendInfoForbaseGameResult?.mysterySymbol;
            this.setMysterySymbol(replaceSymbolId);
        }
        super.updateStrip();
    }

    private setMysterySymbol(replaceSymbolId: number) {
        let mysterySymbolId: number =
            this.gameDataProxy.initEventData.executeSetting.baseGameSetting.baseGameExtendSetting.mysterySymbolId;
        // 有 Mystery symbol 才需要變換 symbol
        if (mysterySymbolId != undefined) {
            let mysterySymbolList =
                this.gameDataProxy.initEventData.executeSetting.baseGameSetting.baseGameExtendSetting.mysterySymbolList;
            replaceSymbolId =
                replaceSymbolId > 0
                    ? replaceSymbolId
                    : mysterySymbolList[MathUtil.randomBetween(0, mysterySymbolList.length - 1)];
            for (let i = 0; i < this.reelDataProxy.rollingStrip.length; i++) {
                for (let j = 0; j < this.reelDataProxy.rollingStrip[i].length; j++) {
                    if (this.reelDataProxy.rollingStrip[i][j] == mysterySymbolId) {
                        this.reelDataProxy.rollingStrip[i][j] = replaceSymbolId;
                    }
                }
            }
        }
    }
    // 顯示最後盤面
    public showLastSymbolOfReels(data: { seatInfo: SeatInfo; mysterySymbol?: number }) {
        const self = this;
        this.stateSetting.setWheelData(data.seatInfo.featureIdx);
        self.reelDataProxy.mathTableIndex = data.seatInfo.usedTableIndex ? data.seatInfo.usedTableIndex : 0;
        self.setMysterySymbol(data.mysterySymbol);
        super.updateStrip();
        for (let infoIndex = 0; infoIndex < data.seatInfo.screenRngInfo.length; infoIndex++) {
            let rngInfo: Array<number> = data.seatInfo.screenRngInfo[infoIndex];
            for (let i = 0; i < rngInfo.length; i++) {
                self.reelView.setTargetRng(infoIndex * rngInfo.length + i, rngInfo[i]);
            }
        }
        self.reelView.reelsShow();
        if (self.gameDataProxy.isOmniChannel()) {
            // 恢復當前輪帶
            self.stateSetting.setWheelData(self.gameDataProxy.curFeatureIdx);
            self.reelDataProxy.mathTableIndex = 0;
        }
    }

    protected handleSlowMotionHit() {
        if (
            (this.gameDataProxy.curRoundResult as FreeGameOneRoundResult).extendInfoForFreeGameResult?.isRespinFeature
        ) {
            const slowReel = 3;
            if (this.reelDataProxy.isSlowMotionAry[slowReel] == false) {
                return false;
            }
            const isFiveOfKind = this.gameDataProxy.curRoundResult.waysGameResult.waysResult.some(
                (result) => result.hitNumber == 5
            );
            return isFiveOfKind;
        } else {
            const lastReel = 4;
            if (this.reelDataProxy.isSlowMotionAry[lastReel] == false) {
                return false;
            }
            const isFiveOfKind = this.gameDataProxy.curRoundResult.waysGameResult.waysResult.some(
                (result) => result.hitNumber == 5
            );
            return isFiveOfKind;
        }
    }

    /**
     * 練習2: 播放收集分數球前的表演動畫
     */
    protected playBeforeCollectBallAnimation() {
        // 獲取BaseGame結果和分數球位置信息
        let ballHitInfo = this.gameDataProxy.spinEventData.baseGameResult.extendInfoForbaseGameResult;
        
        // 找出所有有分數球的位置
        for (let x = 0; x < ballHitInfo.ballScreenLabel.length; x++) {
            for (let y = 0; y < ballHitInfo.ballScreenLabel[x].length; y++) {
                if (ballHitInfo.ballScreenLabel[x][y] > 0) {
                    // 創建SymbolInfo來標識分數球位置
                    let symbolInfo: SymbolInfo = new SymbolInfo();
                    symbolInfo.sid = SymbolId.C1; // 分數球的Symbol ID
                    symbolInfo.x = x;
                    symbolInfo.y = y;
                    
                    // 從pool中取出SymbolFX並播放BEFORE_COLLECT動畫
                    this.reelView.createAnimSymbol(symbolInfo);
                    this.reelView.showBeforeCollectBallAnimation(symbolInfo, this.reelDataProxy.symbolFeature[x][y]);
                }
            }
        }
    }
}
