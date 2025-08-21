import { UIEvent } from 'common-ui/proxy/UIEvent';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { TopUpGameOneRoundResult } from '../../vo/result/TopUpGameOneRoundResult';
import { ClearRecoveryDataCommand } from '../recovery/ClearRecoveryDataCommand';
import { SpinRequestCommand } from '../spin/SpinRequestCommand';
import { StateCommand } from './StateCommand';
import { ButtonName } from 'common-ui/proxy/UIEnums';
import { SpinButton } from 'common-ui/view/SpinButton';

export class Game4SpinCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME4_EV_SPIN;

    public execute(notification: puremvc.INotification): void {
        this.notifyWebControl();
        this.sendNotification(SpinRequestCommand.NAME);
        this.sendNotification(UIEvent.CHANGE_BUTTON_STATE, { name: ButtonName.SPIN, state: SpinButton.STATUS_STOP });

        if (this.gameDataProxy.reStateResult != undefined) {
            this.sendNotification(ClearRecoveryDataCommand.NAME);
        }
    }
}
