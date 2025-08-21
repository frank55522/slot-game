import { Game1RollCompleteCommand } from '../../../sgv3/command/state/Game1RollCompleteCommand';

export class WAY_Game1RollCompleteCommand extends Game1RollCompleteCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);
    }
}
