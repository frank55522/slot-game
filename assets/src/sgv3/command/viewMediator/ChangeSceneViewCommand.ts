import { UIEvent } from 'common-ui/proxy/UIEvent';
import { StateMachineCommand } from '../../../core/command/StateMachineCommand';
import { StateMachineObject } from '../../../core/proxy/CoreStateMachineProxy';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';
import { GameStateProxyEvent, ViewMediatorEvent, WebGameState, StateWinEvent, WinEvent } from '../../util/Constant';
import { GlobalTimer } from '../../util/GlobalTimer';
import { GameScene } from '../../vo/data/GameScene';
import { setEngineTimeScale } from 'src/core/utils/SceneManager';
import { SpeedMode } from 'src/game/vo/enum/Game_UIEnums';
import { ButtonName, ButtonState } from 'common-ui/proxy/UIEnums';
import { UIProxy } from 'common-ui/proxy/UIProxy';

export class ChangeSceneViewCommand extends puremvc.SimpleCommand {
    public static readonly NAME = GameStateProxyEvent.ON_SCENE_CHANGED;

    public execute(notification: puremvc.INotification): void {
        let scene = notification.getBody() as string;
        switch (scene) {
            case GameScene.Game_1:
                this.enableQuickSpin();
                if (this.gameDataProxy.preScene != GameScene.Init) {
                    this.sendNotification(StateWinEvent.ON_GAME1_TRANSITIONS);
                }
                if (this.gameDataProxy.reStateResult) {
                    //Recovery進入場景
                    this.sendNotification(UIEvent.UPDATE_PLAYER_BALANCE, this.gameDataProxy.cash);
                    this.sendNotification(UIEvent.UPDATE_PLAYER_WIN, this.gameDataProxy.playerTotalWin);
                }
                if (this.gameDataProxy.preScene === GameScene.Game_3) {
                    GlobalTimer.getInstance()
                        .registerTimer('Game1_TransitionBG', 1, this.Game1TransitionsBG, this)
                        .start();
                    let emblemLevel = (this.gameDataProxy.curEmblemLevel = this.gameDataProxy.getEmblemLevelInBaseGame());
                    this.sendNotification(ViewMediatorEvent.INIT_EMBLEM_LEVEL, emblemLevel);
                } else {
                    this.sendNotification(
                        StateMachineCommand.NAME,
                        new StateMachineObject(StateMachineProxy.GAME1_INIT)
                    );
                }
                break;
            case GameScene.Game_2:
                this.disableQuickSpin();
                if (this.gameDataProxy.reStateResult) {
                    //Recovery進入場景
                    this.sendNotification(UIEvent.UPDATE_PLAYER_BALANCE, this.gameDataProxy.cash);
                    this.sendNotification(UIEvent.UPDATE_PLAYER_WIN, this.gameDataProxy.playerTotalWin);
                    this.sendNotification(
                        StateMachineCommand.NAME,
                        new StateMachineObject(StateMachineProxy.GAME2_INIT)
                    );
                    // this.sendNotification(ViewMediatorEvent.SHOW_FREE_SPIN_MSG); //顯示Free Spin次數的UI
                    this.webBridgeProxy.sendGameState(WebBridgeProxy.curScene, WebGameState.INIT);
                } else if (this.gameDataProxy.preScene == GameScene.Game_3) {
                    // 變更狀態前 讓Game3觸發LeaveMediator事件
                    this.sendNotification(ViewMediatorEvent.LEAVE);
                    this.sendNotification(ViewMediatorEvent.ENTER);
                    this.webBridgeProxy.sendGameState(WebBridgeProxy.curScene, WebGameState.INIT);

                    this.sendNotification(
                        StateMachineCommand.NAME,
                        new StateMachineObject(StateMachineProxy.GAME2_END)
                    );
                } else {
                    this.webBridgeProxy.setElementDisplayById('maxSpinIcon', 'none');
                    this.sendNotification(StateWinEvent.ON_GAME2_TRANSITIONS, true); //通知轉場動畫
                    this.sendNotification(WinEvent.FORCE_WIN_DISPOSE);
                    GlobalTimer.getInstance()
                        .registerTimer('Game2_TransitionBG', 3.0, this.Game2TransitionsBG, this)
                        .start();
                    return;
                }
                break;
            case GameScene.Game_3:
                this.disableQuickSpin();
                if (this.gameDataProxy.reStateResult) {
                    this.sendNotification(UIEvent.UPDATE_PLAYER_BALANCE, this.gameDataProxy.cash);
                    this.sendNotification(UIEvent.UPDATE_PLAYER_WIN, this.gameDataProxy.playerTotalWin);
                    this.Game3TransitionsBG(); //直接進去遊戲場景
                } else {
                    this.sendNotification(StateWinEvent.ON_GAME3_TRANSITIONS, true); //通知入場的轉場動畫
                    GlobalTimer.getInstance()
                        .registerTimer('Game3_TransitionBG', 3.5, this.Game3TransitionsBG, this)
                        .start();
                }
                return;
            case GameScene.Game_4:
                this.disableQuickSpin();
                if (this.gameDataProxy.reStateResult) {
                    //Recovery進入場景
                    this.sendNotification(UIEvent.UPDATE_PLAYER_BALANCE, this.gameDataProxy.cash);
                    this.sendNotification(UIEvent.UPDATE_PLAYER_WIN, this.gameDataProxy.playerTotalWin);
                    this.sendNotification(
                        StateMachineCommand.NAME,
                        new StateMachineObject(StateMachineProxy.GAME4_INIT)
                    );
                    this.webBridgeProxy.sendGameState(WebBridgeProxy.curScene, WebGameState.INIT);
                } else {
                    this.sendNotification(StateWinEvent.ON_GAME4_TRANSITIONS, true); //通知入場的轉場動畫
                    GlobalTimer.getInstance()
                        .registerTimer('Game4_TransitionBG', 3.0, this.Game4TransitionsBG, this)
                        .start();
                    return;
                }
        }
        this.sendNotification(ViewMediatorEvent.LEAVE);
        this.sendNotification(ViewMediatorEvent.ENTER);
        this.webBridgeProxy.sendGameState(WebBridgeProxy.curScene, WebGameState.INIT);
    }

    private enableQuickSpin() {
        this.sendNotification(UIEvent.CHANGE_BUTTON_STATE, { name: ButtonName.QUICK_SPIN, state: ButtonState.ENABLED });
        //判斷是否需要還原三倍速
        if (this.gameDataProxy.curSpeedMode === SpeedMode.STATUS_TURBO) {
            setEngineTimeScale(3);
            this.UIProxy.isQuickSpin = true;
        } else if (this.gameDataProxy.curSpeedMode === SpeedMode.STATUS_QUICK) {
            this.UIProxy.isQuickSpin = true;
        }
    }

    private disableQuickSpin() {
        this.sendNotification(UIEvent.CHANGE_BUTTON_STATE, {
            name: ButtonName.QUICK_SPIN,
            state: ButtonState.DISABLED
        });
        this.UIProxy.isQuickSpin = false;
        //還原正常速度
        if (this.gameDataProxy.curSpeedMode === SpeedMode.STATUS_TURBO) {
            setEngineTimeScale(1);
        }
    }

    protected Game1TransitionsBG(): void {
        GlobalTimer.getInstance().removeTimer('Game1_TransitionBG');
        this.sendNotification(StateMachineCommand.NAME, new StateMachineObject(StateMachineProxy.GAME1_INIT));
    }

    protected Game2TransitionsBG(): void {
        GlobalTimer.getInstance().removeTimer('Game2_TransitionBG');

        this.sendNotification(StateMachineCommand.NAME, new StateMachineObject(StateMachineProxy.GAME2_INIT));

        this.sendNotification(ViewMediatorEvent.LEAVE);
        this.sendNotification(ViewMediatorEvent.ENTER);
        this.webBridgeProxy.sendGameState(WebBridgeProxy.curScene, WebGameState.INIT);
    }

    protected Game3TransitionsBG(): void {
        GlobalTimer.getInstance().removeTimer('Game3_TransitionBG');

        this.sendNotification(StateMachineCommand.NAME, new StateMachineObject(StateMachineProxy.GAME3_INIT));

        this.sendNotification(ViewMediatorEvent.LEAVE);
        this.sendNotification(ViewMediatorEvent.ENTER);
        this.webBridgeProxy.sendGameState(WebBridgeProxy.curScene, WebGameState.INIT);
    }

    protected Game4TransitionsBG(): void {
        GlobalTimer.getInstance().removeTimer('Game4_TransitionBG');

        this.sendNotification(StateMachineCommand.NAME, new StateMachineObject(StateMachineProxy.GAME4_INIT));

        this.sendNotification(ViewMediatorEvent.LEAVE);
        this.sendNotification(ViewMediatorEvent.ENTER);
        this.webBridgeProxy.sendGameState(WebBridgeProxy.curScene, WebGameState.INIT);
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _webBridgeProxy: WebBridgeProxy;
    protected get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }

    private _UIProxy: UIProxy;
    public get UIProxy(): UIProxy {
        if (!this._UIProxy) {
            this._UIProxy = this.facade.retrieveProxy(UIProxy.NAME) as UIProxy;
        }
        return this._UIProxy;
    }
}
