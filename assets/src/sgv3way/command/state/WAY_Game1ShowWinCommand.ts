import { Game1ShowWinCommand } from '../../../sgv3/command/state/Game1ShowWinCommand';

export class WAY_Game1ShowWinCommand extends Game1ShowWinCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);
    }

    protected showView() {
        super.showView();
    }
}
