import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { StateCommand } from './StateCommand';

export class Game1AfterShowCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME1_EV_AFTERSHOW;

    public execute(notification: puremvc.INotification): void {
        this.checkCompleteConditions();
    }

    private checkCompleteConditions(): void {
        this.changeState(StateMachineProxy.GAME1_END);
    }
}
