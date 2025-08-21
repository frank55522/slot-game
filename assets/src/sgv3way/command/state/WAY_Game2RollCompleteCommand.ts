import { Game2RollCompleteCommand } from '../../../sgv3/command/state/Game2RollCompleteCommand';

export class WAY_Game2RollCompleteCommand extends Game2RollCompleteCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);
    }
}
