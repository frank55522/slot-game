import { Game1EndCommand } from '../../../sgv3/command/state/Game1EndCommand';

export class WAY_Game1EndCommand extends Game1EndCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);
    }
}
