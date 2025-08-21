import { GameDataProxy } from '../../proxy/GameDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { ViewMediatorEvent, StateWinEvent } from '../../util/Constant';
import { GlobalTimer } from '../../util/GlobalTimer';
import { GameScene } from '../../vo/data/GameScene';
import { StateCommand } from './StateCommand';

export class Game4TransitionsCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME4_EV_TRANSITIONS;

    protected timerKey = 'game4Transition';
    public execute(notification: puremvc.INotification): void {
        this.sendNotification(StateWinEvent.ON_GAME4_TRANSITIONS, false);
        GlobalTimer.getInstance().registerTimer(this.timerKey, 0.85, this.showOpening, this).start();
    }

    /** 播放開頭動畫 */
    private showOpening() {
        GlobalTimer.getInstance().removeTimer(this.timerKey);
        this.sendNotification(StateWinEvent.ON_GAME4_OPENING, true); //通知Game4場景，進行開場表演
        GlobalTimer.getInstance().registerTimer(this.timerKey, 1, this.endGameCutScene, this).start();
    }

    /** 過場表演結束 */
    protected endGameCutScene() {
        GlobalTimer.getInstance().removeTimer(this.timerKey);
        this.sendNotification(StateWinEvent.ON_GAME4_OPENING, false); //表演結束，關閉表演物件
        this.changeState(StateMachineProxy.GAME4_IDLE);
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
