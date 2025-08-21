import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { StateWinEvent, ViewMediatorEvent } from '../../util/Constant';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { GlobalTimer } from '../../util/GlobalTimer';
import { StateCommand } from './StateCommand';
import { GameScene } from '../../vo/data/GameScene';

export class Game2TransitionCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME2_EV_TRANSITIONS;

    protected timerKey = 'game2Transition';
    public execute(notification: puremvc.INotification): void {
        this.sendNotification(StateWinEvent.ON_GAME2_TRANSITIONS, false);
        GlobalTimer.getInstance().registerTimer(this.timerKey, 0.85, this.showOpening, this).start();
    }

    /** 播放開頭動畫 */
    private showOpening() {
        GlobalTimer.getInstance().removeTimer(this.timerKey);
        this.sendNotification(StateWinEvent.ON_GAME2_OPENING, true); //通知Game2場景，進行開場表演
        GlobalTimer.getInstance().registerTimer(this.timerKey, 1, this.endGameCutScene, this).start();
    }

    /** 過場表演結束 */
    protected endGameCutScene() {
        GlobalTimer.getInstance().removeTimer(this.timerKey);
        this.sendNotification(StateWinEvent.ON_GAME2_OPENING, false); //表演結束，關閉表演物件
        this.changeState(StateMachineProxy.GAME2_IDLE);
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
