import { Game2ShowWinCommand } from '../../../sgv3/command/state/Game2ShowWinCommand';

export class WAY_Game2ShowWinCommand extends Game2ShowWinCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);
    }

    /** 通知show線 */
    protected showView() {
        super.showView();
    }
}
