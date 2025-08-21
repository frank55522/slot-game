import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { ScreenEvent } from '../../util/Constant';
import { StateCommand } from './StateCommand';

export class Game2IdleCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME2_EV_IDLE;

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
}
