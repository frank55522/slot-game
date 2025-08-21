import { ReelEffectCommand } from '../../../sgv3/command/reeleffect/ReelEffectCommand';
import { ReelEffect_DampingSoundCommand } from './ReelEffect_DampingSoundCommand';
import { ReelEffect_SpinStopSoundCommand } from './ReelEffect_SpinStopSoundCommand';
import { ReelEffect_SymbolFeatureCommand } from './ReelEffect_SymbolFeatureCommand';

export class GAME_ReelEffectCommand extends ReelEffectCommand {
    public initializeMacroCommand() {
        super.initializeMacroCommand();
        this.sendNotification(ReelEffect_SymbolFeatureCommand.NAME);
        this.addSubCommand(ReelEffect_SpinStopSoundCommand);
        this.addSubCommand(ReelEffect_DampingSoundCommand);
    }

    public execute(notification: puremvc.INotification) {
        super.execute(notification);
    }
}
