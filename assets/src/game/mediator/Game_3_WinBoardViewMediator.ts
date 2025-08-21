import { _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { Logger } from '../../core/utils/Logger';
import { CheckGameFlowCommand } from '../../sgv3/command/CheckGameFlowCommand';
import { ChangeGameSceneCommand } from '../../sgv3/command/scene/ChangeGameSceneCommand';
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
import { BonusGameOneRoundResult } from '../../sgv3/vo/result/BonusGameOneRoundResult';
import { AudioManager } from '../../audio/AudioManager';

import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { Game_3_WinBoardView, IGame_3_WinBoardViewMediator } from '../view/Game_3_WinBoardView';
import { AudioClipsEnum, BGMClipsEnum, ScoringClipsEnum } from '../vo/enum/SoundMap';
const { ccclass } = _decorator;

@ccclass('Game_3_WinBoardViewMediator')
export class Game_3_WinBoardViewMediator
    extends BaseMediator<Game_3_WinBoardView>
    implements IGame_3_WinBoardViewMediator
{
    public static readonly NAME: string = 'Game_3_WinBoardViewMediator';
    // SceneData
    protected mySceneName: string = '';
    protected myGameScene: GameScene = null;
    protected mySceneData: GameSceneData = null;

    private delayCloseBoardTimerKey: string = 'delayCloseBoard';
    private showCoinFallTimerKey: string = 'showCoinFall';
    private canSkipRunCreditTimerKey: string = 'canSkipRunCredit';

    private bCanUseSkip: boolean = false;

    protected lastSetupEventList: string[];

    private totalWin: number;

    protected defaultInterestList: string[] = [ViewMediatorEvent.LEAVE, GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE];

    protected myInterestsList: string[] = [
        StateWinEvent.SHOW_LAST_CREDIT_BOARD,
        ViewMediatorEvent.HIDE_ALL_BOARD,
        GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE,
        ViewMediatorEvent.ENTER,
        ScreenEvent.ON_SPIN_DOWN
    ];

    public constructor(name?: string, component?: any) {
        super(name, component);
        Logger.i('[' + Game_3_WinBoardViewMediator.NAME + '] constructor()');
        const self = this;
        self.view.callback = self;
        self.initView();

        // 取得該場景的資料
        let parseName: string[] = Game_3_WinBoardViewMediator.NAME.split('_');
        self.mySceneName = parseName[0] + '_' + parseName[1];
        self.mySceneData = self.gameDataProxy.getSceneDataByName(self.mySceneName);
        self.myGameScene = self.mySceneName;
    }

    protected lazyEventListener(): void {}

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

    public handleNotification(notification: puremvc.INotification) {
        let name = notification.getName();
        const self = this;

        switch (name) {
            case ViewMediatorEvent.LEAVE:
                self.leaveMediator();
                break;
            case StateWinEvent.SHOW_LAST_CREDIT_BOARD:
                self.showWonCreditBoard(notification.getBody());
                break;
            case GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE: // 讓Mediator進入畫面前必須要重整監聽事件
                self.refreshMediatorEventList();
                break;
            case ScreenEvent.ON_SPIN_DOWN: // 按下Spin
                self.onSpinDown();
                break;
        }
    }

    /** 離開場景處理 */
    protected leaveMediator() {
        if (this.gameDataProxy.preScene !== this.mySceneName) {
            this.view.miniResultBoard.node.active = false;
            return;
        }

        if (this.gameDataProxy.preScene !== GameScene.Init) {
            //離開Jackpot場景  更新jackpot獲得金額
            this.facade.sendNotification(ViewMediatorEvent.JACKPOT_WON_SHOW, this.totalWin);
        }

        this.view.hideWonBoard();
    }

    /** 建立畫面 */
    protected initView(): void {}

    private onSpinDown() {
        const self = this;
        // if (self.bCanUseSkip === false) return;
        if (!self.view.skipRunCredit()) return;
        GlobalTimer.getInstance().removeTimer(self.showCoinFallTimerKey);
        GlobalTimer.getInstance()
            .registerTimer(
                self.showCoinFallTimerKey,
                self.mySceneData.bonusCoinFallAfterCreditBoardTime,
                self.showWonBoard_CoinFall,
                self
            )
            .start();
    }

    public onSkip() {
        window['onSpinBtnClick']();
    }

    private showWonCreditBoard(bonusResult: BonusGameOneRoundResult): void {
        const self = this;
        let coinFallTime = self.mySceneData.bonusCoinFallAfterCreditBoardTime;
        self.totalWin = bonusResult.oneRoundJPTotalWin + bonusResult.oneRoundTotalWinWithoutJP;

        let runTimer = self.getWinBoardRunTimer(bonusResult.hitPool);

        self.view.showWonBoard_byBonusGameOneRoundResult(
            self.totalWin,
            runTimer,
            bonusResult.hitPool,
            self.mySceneData.bonusCanSkipRunCreditsTime,
            this.gameDataProxy.language
        );
        self.playSoundScoringJPWin();
        self.playSoundEND01();
        GlobalTimer.getInstance().removeTimer(self.showCoinFallTimerKey);
        GlobalTimer.getInstance()
            .registerTimer(self.showCoinFallTimerKey, runTimer + coinFallTime, self.showWonBoard_CoinFall, self)
            .start();

        if (self.view.checkCanSkipRunCredit()) {
            GlobalTimer.getInstance().removeTimer(self.canSkipRunCreditTimerKey);
            GlobalTimer.getInstance()
                .registerTimer(
                    self.canSkipRunCreditTimerKey,
                    self.mySceneData.bonusCanSkipRunCreditsTime,
                    self.setCanUseSkip,
                    self
                )
                .start();
        }
    }

    private setCanUseSkip() {
        this.bCanUseSkip = true;
    }

    private getWinBoardRunTimer(hitInfo: number[]): number {
        let timer = 0;

        let miniTime = 6.02;
        let minorTime = 26.993;
        let majorTime = 30.02;
        let grandTime = 50.993;

        let biggestSymbol = JackpotPool.MINI;
        for (let i = 0; i < hitInfo.length; i++) {
            if (hitInfo[i] < biggestSymbol) {
                biggestSymbol = hitInfo[i];
            }
        }

        switch (biggestSymbol) {
            case JackpotPool.GRAND:
                timer = grandTime;
                this.mySceneData.bonusCanSkipRunCreditsTime = 5;
                break;
            case JackpotPool.MAJOR:
                timer = majorTime;
                this.mySceneData.bonusCanSkipRunCreditsTime = 5;
                break;
            case JackpotPool.MINOR:
                timer = minorTime;
                this.mySceneData.bonusCanSkipRunCreditsTime = 3;
                break;
            case JackpotPool.MINI:
                timer = miniTime;
                this.mySceneData.bonusCanSkipRunCreditsTime = 3;
                break;
        }
        return timer;
    }

    private showWonBoard_CoinFall(): void {
        const self = this;
        self.view.stopWinCoinFall();
        this.bCanUseSkip = false;
        GlobalTimer.getInstance()
            .registerTimer(
                self.delayCloseBoardTimerKey,
                self.mySceneData.bonusCloseViewAfterCoinFallTime,
                self.delayCloseBoard,
                self
            )
            .start();
    }

    /** 延遲關閉面板處理 */
    protected delayCloseBoard() {
        const self = this;
        self.sendNotification(JackpotPool.HIT_JACKPOT_TO_POOL_VALUE_INIT);

        GlobalTimer.getInstance().removeTimer(self.delayCloseBoardTimerKey);
        if (self.gameDataProxy.preScene == GameScene.Game_1) {
            if (
                !!self.gameDataProxy.spinEventData.gameStateResult &&
                self.gameDataProxy.spinEventData.gameStateResult.length > 0
            ) {
                if (!!self.gameDataProxy.spinEventData.gameStateResult[0].gameSceneName) {
                    self.sendNotification(ChangeGameSceneCommand.NAME, GameScene.Game_1);
                    return;
                }
            }
        }
        self.sendNotification(CheckGameFlowCommand.NAME);
    }

    playRunCreditsCompletedSound(): void {
        AudioManager.Instance.stop(ScoringClipsEnum.Scoring_JPWinIntro);
        AudioManager.Instance.stop(ScoringClipsEnum.Scoring_JPWinLoop);
        AudioManager.Instance.play(ScoringClipsEnum.Scoring_JPWinEnd);
    }

    playSoundEND01(): void {
        AudioManager.Instance.play(AudioClipsEnum.MiniEnd01);
    }
    playSoundEND02(): void {
        AudioManager.Instance.play(AudioClipsEnum.MiniEnd01);
    }

    playSoundEND03(): void {
        AudioManager.Instance.play(AudioClipsEnum.MiniEnd01);
    }

    playSoundScoringJPWin(): void {
        AudioManager.Instance.stop(BGMClipsEnum.BGM_Mini).fade(0, 1);
        let audio = AudioManager.Instance.play(ScoringClipsEnum.Scoring_JPWinLoop).volume(0).loop(true);
        AudioManager.Instance.play(ScoringClipsEnum.Scoring_JPWinIntro).callback(() => {
            audio.volume(1).replay();
        });
    }

    /** 更新 Mediator 監聽的事件 */
    protected refreshMediatorEventList(): void {
        const self = this;
        self.facade.removeMediator(self.mediatorName);
        self.facade.registerMediator(self);
    }

    // ======================== Get Set ========================
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
}
