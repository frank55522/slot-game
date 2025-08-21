import { StateMachineCommand } from '../../../core/command/StateMachineCommand';
import { StateMachineObject } from '../../../core/proxy/CoreStateMachineProxy';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { ReelEvent, StateWinEvent, ViewMediatorEvent } from '../../util/Constant';
import { GlobalTimer } from '../../util/GlobalTimer';
import { GameScene } from '../../vo/data/GameScene';
import { MaintainGame1ShowwinCommand } from '../connect/MaintainGame1ShowwinCommand';
import { TakeWinCommand } from '../balance/TakeWinCommand';
import { UIEvent } from 'common-ui/proxy/UIEvent';
import { ButtonName } from 'common-ui/proxy/UIEnums';
import { SpinButton } from 'common-ui/view/SpinButton';
import { CheckNormalButtonStateCommand } from 'src/game/command/CheckNormalButtonStateCommand';

/** 最後滾分後處理 */
export class WinBoardRunCompleteCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'WinBoardRunCompleteCommand';
    protected timerName = 'WinBoardRunComplete';
    protected miniGameDelayTime: number = 0.8;

    public execute(notification: puremvc.INotification) {
        const self = this;
        this.gameDataProxy.rollingMoneyEnd = true;
        this.gameDataProxy.scrollingWinLabel = false;
        this.gameDataProxy.runWinComplete = true;
        this.gameDataProxy.scrollingWinLabelCanSkip = false;

        switch (self.gameDataProxy.curScene) {
            case GameScene.Game_1:
                self.game1();
                break;
            case GameScene.Game_2:
                if (this.gameDataProxy.gameState == StateMachineProxy.GAME2_SHOWWIN) {
                    self.game2();
                }
                break;
            default:
                self.other();
                break;
        }
        this.sendNotification(CheckNormalButtonStateCommand.NAME);
    }

    /** Game1處理最後滾分事件 */
    public game1() {
        const self = this;
        self.gameDataProxy.afterFeatureGame = false;
        if (self.gameDataProxy.isHitSpecial() || self.gameDataProxy.preScene == 'Game_3') {
            // 檢查 下一Round 是否為特殊中獎(free_game, bonus_game)
            // 檢查 是否從MiniGame回來，是的話直接往下走
            // 若中MiniGame，需升階表演結束才進下個流程
            const isHitMiniGame = self.gameDataProxy.isHitMiniGame();
            const isReadyEnterMiniGame = self.gameDataProxy.isReadyEnterMiniGame;
            
            if (!isHitMiniGame || (isHitMiniGame && isReadyEnterMiniGame)) {
                self.game1DelayAfterShow(self.miniGameDelayTime);
            }
        } else {
            self.game1DelayAfterShow(self.gameDataProxy.commonSetting.endWinDelayTime);
        }
    }

    private game1DelayAfterShow(delaytime: number = 0) {
        const self = this;
        GlobalTimer.getInstance().removeTimer(this.timerName);
        GlobalTimer.getInstance()
            .registerTimer(
                this.timerName,
                delaytime,
                () => {
                    GlobalTimer.getInstance().removeTimer(this.timerName);
                    if (self.gameDataProxy.gameState == StateMachineProxy.GAME1_SHOWWIN)
                        self.sendNotification(
                            StateMachineCommand.NAME,
                            new StateMachineObject(StateMachineProxy.GAME1_AFTERSHOW)
                        );
                },
                self
            )
            .start();
    }

    /** Game2處理最後滾分事件 */
    public game2() {
        const self = this;
        GlobalTimer.getInstance().removeTimer(this.timerName);
        GlobalTimer.getInstance()
            .registerTimer(
                this.timerName,
                1,
                () => {
                    GlobalTimer.getInstance().removeTimer(this.timerName);
                    self.sendNotification(
                        StateMachineCommand.NAME,
                        new StateMachineObject(StateMachineProxy.GAME2_AFTERSHOW)
                    );
                },
                self
            )
            .start();
    }

    /** 其他處理最後滾分事件 */
    protected other() {}

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _stateMachineProxy: StateMachineProxy;
    public get stateMachineProxy(): StateMachineProxy {
        if (!this._stateMachineProxy) {
            this._stateMachineProxy = this.facade.retrieveProxy(StateMachineProxy.NAME) as StateMachineProxy;
        }
        return this._stateMachineProxy;
    }

    protected _webBridgeProxy: WebBridgeProxy;
    protected get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }
}
