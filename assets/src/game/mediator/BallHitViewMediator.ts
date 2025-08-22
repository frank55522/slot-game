import { Vec2, _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { SceneManager } from '../../core/utils/SceneManager';
import { BalanceUtil } from '../../sgv3/util/BalanceUtil';

import {
    DragonUpEvent,
    FreeGameEvent,
    GameStateProxyEvent,
    ReelEvent,
    SceneEvent,
    ScreenEvent,
    StateWinEvent,
    ViewMediatorEvent
} from '../../sgv3/util/Constant';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { AudioManager } from '../../audio/AudioManager';

import { GAME_4_CreditCollectResultCommand } from '../command/dragon-up/GAME_4_CreditCollectResultCommand';
import { MathUtil } from '../../core/utils/MathUtil';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { BallHitView } from '../view/BallHitView';
import { BGMClipsEnum } from '../vo/enum/SoundMap';
import { GlobalTimer } from '../../sgv3/util/GlobalTimer';
import { StateMachineProxy } from '../../sgv3/proxy/StateMachineProxy';

const { ccclass } = _decorator;

@ccclass('BallHitViewMediator')
export class BallHitViewMediator extends BaseMediator<BallHitView> {
    public static readonly NAME: string = 'BallHitViewMediator';

    public constructor(name?: string, component?: any) {
        super(name, component);
        this.view.callBack = this;
    }

    private numInBall: number = 0;
    private ballTotalCount: number = 0;
    private ballSequenceIndex: number = 0;

    private bCanUseSkip: boolean = false;
    protected tempFunc: Function;

    protected lazyEventListener(): void {
        this.initView();
    }

    public listNotificationInterests(): Array<any> {
        return [
            ReelEvent.ON_REELS_PERFORM_END,
            SceneEvent.LOAD_BASE_COMPLETE,
            StateWinEvent.ON_GAME1_TRANSITIONS,
            StateWinEvent.ON_GAME2_TRANSITIONS,
            StateWinEvent.ON_GAME3_TRANSITIONS,
            StateWinEvent.ON_GAME3_RECOVERY,
            StateWinEvent.ON_GAME4_TRANSITIONS,
            ViewMediatorEvent.PREPARE_COLLECT_BALL,
            ViewMediatorEvent.COLLECT_CREDIT_BALL,
            ViewMediatorEvent.COLLECT_CREDIT_BALL_SKIP_CALLBACK,
            ViewMediatorEvent.INIT_EMBLEM_LEVEL,
            ViewMediatorEvent.UPDATE_EMBLEM_LEVEL,
            DragonUpEvent.ON_ALL_CREDIT_COLLECT_START,
            DragonUpEvent.ON_C2_COUNT_UPDATE,
            DragonUpEvent.ON_BASEGAME_WIN_DISPLAY,
            SceneManager.EV_ORIENTATION_VERTICAL,
            SceneManager.EV_ORIENTATION_HORIZONTAL,
            GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE,
            GAME_4_CreditCollectResultCommand.NAME,
            FreeGameEvent.ON_BEFORE_END_SCORE_SHOW,
            ScreenEvent.ON_SPIN_DOWN
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case ReelEvent.ON_REELS_PERFORM_END:
                this.ballHitShow();
                break;
            case SceneEvent.LOAD_BASE_COMPLETE:
                this.view.node.active = true;
                break;
            case StateWinEvent.ON_GAME1_TRANSITIONS:
                this.baseGameTransition();
                break;
            case StateWinEvent.ON_GAME2_TRANSITIONS:
                if (notification.getBody() == false) this.freeGameTransition();
                break;
            case StateWinEvent.ON_GAME4_TRANSITIONS:
                if (notification.getBody() == false) this.topUpGameTransition();
                break;
            case StateWinEvent.ON_GAME3_TRANSITIONS:
                if (notification.getBody() == true) this.view.miniGameTransition();
                break;
            case StateWinEvent.ON_GAME3_RECOVERY:
                this.view.miniGameRecovery();
                break;
            case ViewMediatorEvent.PREPARE_COLLECT_BALL:
                this.prepareCollectBall();
                break;
            case ViewMediatorEvent.COLLECT_CREDIT_BALL:
                this.collectCreditBall(notification.getBody());
                break;
            case ViewMediatorEvent.COLLECT_CREDIT_BALL_SKIP_CALLBACK:
                this.collectCreditBallOnSkip(notification.getBody());
                break;
            case ViewMediatorEvent.INIT_EMBLEM_LEVEL:
                this.initEmblemLevel(notification.getBody());
                break;
            case ViewMediatorEvent.UPDATE_EMBLEM_LEVEL:
                this.updateEmblemLevel(notification.getBody());
                break;
            case DragonUpEvent.ON_C2_COUNT_UPDATE:
                this.updateBallCount(notification.getBody());
                break;
            case GAME_4_CreditCollectResultCommand.NAME:
                this.hideBallCountInfo();
                break;
            case GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE:
                this.view.changeOrientation(this.gameDataProxy.orientationEvent, this.gameDataProxy.curScene);
                this.view.changeScene(this.gameDataProxy.curScene);
                this.loadingTransition();
                break;
            case FreeGameEvent.ON_BEFORE_END_SCORE_SHOW:
                this.freeGameBallScoreSumShow(notification.getBody());
                break;
            case ScreenEvent.ON_SPIN_DOWN:
                this.onSpinDown();
                break;
            case DragonUpEvent.ON_BASEGAME_WIN_DISPLAY:
                this.displayBaseGameWinOnBall(notification.getBody());
                break;
        }
    }

    private initView() {
        this.view.baseGameIdle();
        let initLevel: number[] = [];
        initLevel = this.gameDataProxy.getInitEmblemLevel();
        this.initEmblemLevel(initLevel);
    }

    private initEmblemLevel(level: number[]) {
        this.view.initEmblemLevel(level);
    }

    private updateEmblemLevel(level: number[]) {
        if (level != null) {
            this.view.updateEmblemLevel(level);
        }
    }

    private ballHitShow() {
        if (this.gameDataProxy.curScene != GameScene.Game_1) return;
        let ballHitInfo = this.gameDataProxy.spinEventData.baseGameResult.extendInfoForbaseGameResult;
        if (ballHitInfo['ballCount'] > 0) {
            this.view.ballHitShow(ballHitInfo);
        }
    }

    private loadingTransition() {
        if (
            String(this.gameDataProxy.preScene) == String(GameScene.Init) &&
            String(this.gameDataProxy.curScene) == String(GameScene.Game_1)
        ) {
            this.view.baseGameIdle();
        }
    }

    private baseGameTransition() {
        switch (this.gameDataProxy.preScene) {
            case GameScene.Game_3:
                this.view.fadeInBaseGameIdle();
                break;
            case GameScene.Game_2:
            case GameScene.Game_4:
                this.view.baseGameIdle();
                this.hideBallCountInfo();
                this.hideBallCredit();
                break;
        }
    }

    private freeGameTransition() {
        this.numInBall = this.gameDataProxy.ballTotalCredit;
        let ballCash = this.gameDataProxy.isOmniChannel()
            ? this.numInBall.toString()
            : BalanceUtil.formatBalance(this.numInBall);
        this.view.setBallCredit(ballCash, 4);
    }

    private topUpGameTransition() {
        this.hideBallCredit();
        this.numInBall = this.gameDataProxy.ballTotalCount;
        this.ballTotalCount = this.numInBall;
        this.view.showBallCountInfo(this.numInBall.toString());
    }

    //** free game 結算前 加總 特色 */
    private freeGameBallScoreSumShow(runningTime: number) {
        let self = this;
        self.view.ballScoreSumShow();
        GlobalTimer.getInstance()
            .registerTimer(
                FreeGameEvent.ON_SIDE_BALL_SHOW,
                runningTime,
                function () {
                    self.sendNotification(FreeGameEvent.ON_BEFORE_END_SCORE_SHOW_SKIP, runningTime);
                    GlobalTimer.getInstance().removeTimer(FreeGameEvent.ON_SIDE_BALL_SHOW);
                }.bind(self),
                self
            )
            .start();
    }
    // 準備收集龍珠分數的表演，直式需放大龍珠
    private prepareCollectBall() {
        this.view.freeGameIdle();
        AudioManager.Instance.stop(BGMClipsEnum.BGM_Base).fade(0, 1);
        AudioManager.Instance.play(BGMClipsEnum.BGM_FeatureSelection).loop(true).volume(0).fade(1, 1.5);
    }

    // 龍珠分數收集
    private collectCreditBall(infoArray: Array<any>) {
        let pos: Vec2 = infoArray[0]; // index 0: 位置資訊Index
        this.numInBall = MathUtil.add(this.numInBall, infoArray[1]); // index 1: 顯示數值資訊
        let index = Number(pos.x * 3 + pos.y);
        let ballCash = this.gameDataProxy.isOmniChannel()
            ? this.numInBall.toString()
            : BalanceUtil.formatBalance(this.numInBall);
        switch (this.gameDataProxy.curScene) {
            case GameScene.Game_1:
                this.view.setBallCredit(ballCash, 0);
                break;
            case GameScene.Game_2:
                this.view.performTrailOnBall(index, ballCash, 1, 0.3);
                break;
            case GameScene.Game_4:
                this.ballSequenceIndex++;
                if (this.ballSequenceIndex >= this.ballTotalCount) this.ballSequenceIndex = 0;
                this.view.performTrailOnBall(index, ballCash, 2, 0.2, this.ballSequenceIndex);
                break;
        }
    }

    private collectCreditBallOnSkip(cb: Function) {
        this.tempFunc = cb;
        this.bCanUseSkip = false;
        GlobalTimer.getInstance().removeTimer('canSkipTimer');
        GlobalTimer.getInstance()
            .registerTimer('canSkipTimer', 1.25, () => (this.bCanUseSkip = true), this)
            .start();
    }

    // 更新龍珠數量
    private updateBallCount(ballInfo: number) {
        this.numInBall += ballInfo;
        this.ballTotalCount = this.numInBall;
        this.view.showBallCountInfo(this.numInBall.toString());
    }

    private hideBallCredit() {
        this.numInBall = 0;
        this.view.hideBallCredit();
    }

    private hideBallCountInfo() {
        this.numInBall = 0;
        this.ballSequenceIndex = 0;
        this.view.hideBallCountInfo();
    }

    public finishBallTransition() {
        this.sendNotification(StateWinEvent.ON_GAME3_SHOW_SELECTION);
    }

    private onSpinDown() {
        // 在 BaseGame 中，spin 開始時清除龍珠上的贏分顯示
        if (this.gameDataProxy.curScene === GameScene.Game_1) {
            this.hideBallCredit();
        }
        
        if (this.gameDataProxy.gameState == StateMachineProxy.GAME4_END) {
            if (this.bCanUseSkip == false) return;
            this.bCanUseSkip = false;
            this.tempFunc();
        }
    }

    private displayBaseGameWinOnBall(data: { winAmount: number; formattedWin: string }): void {
        // 檢查目前場景是否為 Game_1 (BaseGame)
        if (this.gameDataProxy.curScene !== GameScene.Game_1) {
            return;
        }

        // 在上方大龍珠顯示當局 BaseGame 贏分
        // playType 0 表示 BaseGame 的顯示模式
        this.view.setBallCredit(data.formattedWin, 0);
    }

    private _gameDataProxy: GAME_GameDataProxy;
    private get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
