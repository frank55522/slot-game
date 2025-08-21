import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { GlobalTimer } from '../../util/GlobalTimer';
import { StateCommand } from './StateCommand';

export class Game4BeforeShowCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME4_EV_BEFORESHOW;

    protected timerKey = 'game4BeforeShow';

    public execute(notification: puremvc.INotification): void {
        let sceneData = this.gameDataProxy.getSceneDataByName(this.gameDataProxy.curScene);
        this.notifyWebControl();
        this.clearTimerKey(); //避免timer沒有清除的問題
       
        if (this.reelDataProxy.isHasNewLock) {
            this.changeState(StateMachineProxy.GAME4_SHOWWIN);
        } else {
            let stayTime = sceneData.noWinStayTime;
            GlobalTimer.getInstance()
                .registerTimer(
                    this.timerKey,
                    stayTime,
                    () => {
                        GlobalTimer.getInstance().removeTimer(this.timerKey);
                        this.changeState(StateMachineProxy.GAME4_END);
                    },
                    this
                )
                .start();
        }
    }

    private clearTimerKey() {
        GlobalTimer.getInstance().removeTimer(this.timerKey);
    }

    // ======================== Get Set ======================== 
    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }
}
