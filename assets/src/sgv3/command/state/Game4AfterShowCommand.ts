import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { StateCommand } from './StateCommand';
import { WinEvent } from '../../util/Constant';
export class Game4AfterShowCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME4_EV_AFTERSHOW;

    public execute(notification: puremvc.INotification): void {
        this.checkCompleteConditions();
    }

    private checkCompleteConditions(): void {
        this.notifyWebControl();
        this.changeState(StateMachineProxy.GAME4_END);
    }
}
