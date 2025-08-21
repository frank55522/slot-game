import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { StateCommand } from './StateCommand';
export class Game2AfterShowCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME2_EV_AFTERSHOW;

    public execute(notification: puremvc.INotification): void {
        this.checkCompleteConditions();
    }

    private checkCompleteConditions(): void {
        this.notifyWebControl();
        this.changeState(StateMachineProxy.GAME2_END);
    }
}
