import { RegisterStateCommand } from '../../sgv3/command/register/RegisterStateCommand';
import { WAY_Game1BeforeShowCommand } from './state/WAY_Game1BeforeShowCommand';
import { WAY_Game1EndCommand } from './state/WAY_Game1EndCommand';
import { WAY_Game1HitSpecialCommand } from './state/WAY_Game1HitSpecialCommand';
import { WAY_Game1IdleCommand } from './state/WAY_Game1IdleCommand';
import { WAY_Game1InitCommand } from './state/WAY_Game1InitCommand';
import { WAY_Game1RollCompleteCommand } from './state/WAY_Game1RollCompleteCommand';
import { WAY_Game1ShowWinCommand } from './state/WAY_Game1ShowWinCommand';
import { WAY_Game1SpinCommand } from './state/WAY_Game1SpinCommand';
import { WAY_Game2BeforeShowCommand } from './state/WAY_Game2BeforeShowCommand';
import { WAY_Game2EndCommand } from './state/WAY_Game2EndCommand';
import { WAY_Game2HitSpecialCommand } from './state/WAY_Game2HitSpecialCommand';
import { WAY_Game2IdleCommand } from './state/WAY_Game2IdleCommand';
import { WAY_Game2InitCommand } from './state/WAY_Game2InitCommand';
import { WAY_Game2RollCompleteCommand } from './state/WAY_Game2RollCompleteCommand';
import { WAY_Game2ShowWinCommand } from './state/WAY_Game2ShowWinCommand';
import { WAY_Game2SpinCommand } from './state/WAY_Game2SpinCommand';
import { Game3InitCommand } from '../../sgv3/command/state/Game3InitCommand';
import { Game3ShowWinCommand } from '../../sgv3/command/state/Game3ShowWinCommand';
import { Game3IdleCommand } from '../../sgv3/command/state/Game3IdleCommand';
import { Game3EndCommand } from '../../sgv3/command/state/Game3EndCommand';

export class WAY_RegisterStateCommand extends RegisterStateCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);
        /** Game1 */
        this.facade.registerCommand(WAY_Game1InitCommand.NAME, WAY_Game1InitCommand);
        this.facade.registerCommand(WAY_Game1IdleCommand.NAME, WAY_Game1IdleCommand);
        this.facade.registerCommand(WAY_Game1SpinCommand.NAME, WAY_Game1SpinCommand);
        this.facade.registerCommand(WAY_Game1RollCompleteCommand.NAME, WAY_Game1RollCompleteCommand);
        this.facade.registerCommand(WAY_Game1HitSpecialCommand.NAME, WAY_Game1HitSpecialCommand);
        this.facade.registerCommand(WAY_Game1BeforeShowCommand.NAME, WAY_Game1BeforeShowCommand);
        this.facade.registerCommand(WAY_Game1ShowWinCommand.NAME, WAY_Game1ShowWinCommand);
        this.facade.registerCommand(WAY_Game1EndCommand.NAME, WAY_Game1EndCommand);

        /** Game2 */
        this.facade.registerCommand(WAY_Game2InitCommand.NAME, WAY_Game2InitCommand);
        this.facade.registerCommand(WAY_Game2SpinCommand.NAME, WAY_Game2SpinCommand);
        this.facade.registerCommand(WAY_Game2RollCompleteCommand.NAME, WAY_Game2RollCompleteCommand);
        this.facade.registerCommand(WAY_Game2HitSpecialCommand.NAME, WAY_Game2HitSpecialCommand);
        this.facade.registerCommand(WAY_Game2BeforeShowCommand.NAME, WAY_Game2BeforeShowCommand);
        this.facade.registerCommand(WAY_Game2ShowWinCommand.NAME, WAY_Game2ShowWinCommand);
        this.facade.registerCommand(WAY_Game2IdleCommand.NAME, WAY_Game2IdleCommand);
        this.facade.registerCommand(WAY_Game2EndCommand.NAME, WAY_Game2EndCommand);

        /** Game3 */
        this.facade.registerCommand(Game3InitCommand.NAME, Game3InitCommand);
        this.facade.registerCommand(Game3ShowWinCommand.NAME, Game3ShowWinCommand);
        this.facade.registerCommand(Game3IdleCommand.NAME, Game3IdleCommand);
        this.facade.registerCommand(Game3EndCommand.NAME, Game3EndCommand);
    }
}
