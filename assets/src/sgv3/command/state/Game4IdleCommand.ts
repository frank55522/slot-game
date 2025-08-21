import { GameDataProxy } from '../../proxy/GameDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { ScreenEvent } from '../../util/Constant';
import { StateCommand } from './StateCommand';

export class Game4IdleCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME4_EV_IDLE;

   
    protected timerKey = 'game4Transition';
    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        if (this.gameDataProxy.curStateResult) {
            // 報表模式不自動 SpinDown
            if (this.gameDataProxy.isReportMode) {
                return;
            }

            this.sendNotification(ScreenEvent.ON_SPIN_DOWN);
        }
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
