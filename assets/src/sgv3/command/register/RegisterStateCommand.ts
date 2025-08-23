import { Game1AfterShowCommand } from '../state/Game1AfterShowCommand';
import { Game1BeforeShowCommand } from '../state/Game1BeforeShowCommand';
import { Game1CountdownCommand } from '../state/Game1CountdownCommand';
import { Game1EndCommand } from '../state/Game1EndCommand';
import { Game1FeatureSelectionCommand } from '../state/Game1FeatureSelectionCommand';
import { Game1HitSpecialCommand } from '../state/Game1HitSpecialCommand';
import { Game1IdleCommand } from '../state/Game1IdleCommand';
import { Game1InitCommand } from '../state/Game1InitCommand';
import { Game1RollCompleteCommand } from '../state/Game1RollCompleteCommand';
import { Game1ShowWinCommand } from '../state/Game1ShowWinCommand';
import { Game1SpinCommand } from '../state/Game1SpinCommand';
import { Game2AfterShowCommand } from '../state/Game2AfterShowCommand';
import { Game2BeforeShowCommand } from '../state/Game2BeforeShowCommand';
import { Game2HitSpecialCommand } from '../state/Game2HitSpecialCommand';
import { Game2IdleCommand } from '../state/Game2IdleCommand';
import { Game2InitCommand } from '../state/Game2InitCommand';
import { Game2RollCompleteCommand } from '../state/Game2RollCompleteCommand';
import { Game2ShowWinCommand } from '../state/Game2ShowWinCommand';
import { Game2SpinCommand } from '../state/Game2SpinCommand';
import { Game2TransitionCommand } from '../state/Game2TransitionsCommand';
import { Game3IdleCommand } from '../state/Game3IdleCommand';
import { Game3InitCommand } from '../state/Game3InitCommand';
import { Game3ShowWinCommand } from '../state/Game3ShowWinCommand';
import { Game4AfterShowCommand } from '../state/Game4AfterShowCommand';
import { Game4BeforeShowCommand } from '../state/Game4BeforeShowCommand';
import { Game4EndCommand } from '../state/Game4EndCommand';
import { Game4HitSpecialCommand } from '../state/Game4HitSpecialCommand';
import { Game4IdleCommand } from '../state/Game4IdleCommand';
import { Game4InitCommand } from '../state/Game4InitCommand';
import { Game4RollCompleteCommand } from '../state/Game4RollCompleteCommand';
import { Game4ShowWinCommand } from '../state/Game4ShowWinCommand';
import { Game4SpinCommand } from '../state/Game4SpinCommand';
import { Game4TransitionsCommand } from '../state/Game4TransitionsCommand';

export class RegisterStateCommand extends puremvc.SimpleCommand {
    public execute(notification: puremvc.INotification): void {
        // /** Game1 */
        this.facade.registerCommand(Game1InitCommand.NAME, Game1InitCommand);
        this.facade.registerCommand(Game1IdleCommand.NAME, Game1IdleCommand);
        this.facade.registerCommand(Game1SpinCommand.NAME, Game1SpinCommand);
        this.facade.registerCommand(Game1CountdownCommand.NAME, Game1CountdownCommand);
        this.facade.registerCommand(Game1RollCompleteCommand.NAME, Game1RollCompleteCommand);
        this.facade.registerCommand(Game1HitSpecialCommand.NAME, Game1HitSpecialCommand);
        this.facade.registerCommand(Game1BeforeShowCommand.NAME, Game1BeforeShowCommand);
        this.facade.registerCommand(Game1ShowWinCommand.NAME, Game1ShowWinCommand);
        this.facade.registerCommand(Game1AfterShowCommand.NAME, Game1AfterShowCommand);
        this.facade.registerCommand(Game1EndCommand.NAME, Game1EndCommand);
        this.facade.registerCommand(Game1FeatureSelectionCommand.NAME, Game1FeatureSelectionCommand);
        /** Game2 */
        this.facade.registerCommand(Game2InitCommand.NAME, Game2InitCommand);
        this.facade.registerCommand(Game2TransitionCommand.NAME, Game2TransitionCommand);
        this.facade.registerCommand(Game2IdleCommand.NAME, Game2IdleCommand);
        this.facade.registerCommand(Game2SpinCommand.NAME, Game2SpinCommand);
        this.facade.registerCommand(Game2RollCompleteCommand.NAME, Game2RollCompleteCommand);
        this.facade.registerCommand(Game2HitSpecialCommand.NAME, Game2HitSpecialCommand);
        this.facade.registerCommand(Game2BeforeShowCommand.NAME, Game2BeforeShowCommand);
        this.facade.registerCommand(Game2ShowWinCommand.NAME, Game2ShowWinCommand);
        this.facade.registerCommand(Game2AfterShowCommand.NAME, Game2AfterShowCommand);
        /** Game3 */
        this.facade.registerCommand(Game3InitCommand.NAME, Game3InitCommand);
        this.facade.registerCommand(Game3IdleCommand.NAME, Game3IdleCommand);
        this.facade.registerCommand(Game3ShowWinCommand.NAME, Game3ShowWinCommand);

        /** Game4 */
        this.facade.registerCommand(Game4InitCommand.NAME, Game4InitCommand);
        this.facade.registerCommand(Game4TransitionsCommand.NAME, Game4TransitionsCommand);
        this.facade.registerCommand(Game4IdleCommand.NAME, Game4IdleCommand);
        this.facade.registerCommand(Game4SpinCommand.NAME, Game4SpinCommand);
        this.facade.registerCommand(Game4RollCompleteCommand.NAME, Game4RollCompleteCommand);
        this.facade.registerCommand(Game4HitSpecialCommand.NAME, Game4HitSpecialCommand);
        this.facade.registerCommand(Game4BeforeShowCommand.NAME, Game4BeforeShowCommand);
        this.facade.registerCommand(Game4ShowWinCommand.NAME, Game4ShowWinCommand);
        this.facade.registerCommand(Game4AfterShowCommand.NAME, Game4AfterShowCommand);
        this.facade.registerCommand(Game4EndCommand.NAME, Game4EndCommand);
    }
}
