import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { ViewMediatorEvent } from '../../util/Constant';
import { StateCommand } from './StateCommand';

export class Game1FeatureSelectionCommand extends StateCommand {
    public static readonly NAME = StateMachineProxy.GAME1_EV_FEATURESELECTION;

    public execute(notification: puremvc.INotification): void {
        // 顯示 Feature selection view
        this.sendNotification(ViewMediatorEvent.SHOW_FEATURE_SELECTION);
    }
}
