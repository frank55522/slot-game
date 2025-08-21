import { ReelDataProxy } from '../../proxy/ReelDataProxy';
import { ReelEffectPrizePredictionCommand } from './ReelEffectPrizePredictionCommand';
import { ReelEffectSlowMotionCommand } from './ReelEffectSlowMotionCommand';

export class ReelEffectCommand extends puremvc.MacroCommand {
    public static readonly NAME = 'ReelEffectCommand';

    public initializeMacroCommand() {
        this.addSubCommand(ReelEffectSlowMotionCommand);
        this.addSubCommand(ReelEffectPrizePredictionCommand);
    }

    public execute(notification: puremvc.INotification) {
        let reelDataProxy: ReelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        reelDataProxy.reset();
        super.execute(notification);
    }
}
