import { RegisterPuremvcCommand } from '../../sgv3/command/register/RegisterPuremvcCommand';
import { WAY_DefaultSettingCommand } from './WAY_DefaultSettingCommand';
import { WAY_ParseRoundWinResultCommand } from './WAY_ParseRoundWinResultCommand';
import { WAY_ParseStateWinResultCommand } from './WAY_ParseStateWinResultCommand';
import { WAY_SpinRequestCommand } from './WAY_SpinRequestCommand';

export abstract class WAY_RegisterPuremvcCommand extends RegisterPuremvcCommand {
    protected registerCommand(): void {
        super.registerCommand();
        this.facade.registerCommand(WAY_DefaultSettingCommand.NAME, WAY_DefaultSettingCommand);
        this.facade.registerCommand(WAY_ParseStateWinResultCommand.NAME, WAY_ParseStateWinResultCommand);
        this.facade.registerCommand(WAY_ParseRoundWinResultCommand.NAME, WAY_ParseRoundWinResultCommand);
        this.facade.registerCommand(WAY_SpinRequestCommand.NAME, WAY_SpinRequestCommand);
        this.facade.registerCommand(WAY_SpinRequestCommand.FEATURERESPONSE, WAY_SpinRequestCommand);
    }
}
