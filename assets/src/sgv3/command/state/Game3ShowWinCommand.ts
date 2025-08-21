import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { StateWinEvent } from '../../util/Constant';
import { StateCommand } from './StateCommand';

export class Game3ShowWinCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME3_EV_SHOWWIN;

    public execute(notification: puremvc.INotification): void {
        const self = this;
        self.notifyWebControl();
        self.changeState(StateMachineProxy.GAME3_END);
        self.sendNotification(StateWinEvent.ON_GAME3_SHOW_INFO, false);
    }
}
