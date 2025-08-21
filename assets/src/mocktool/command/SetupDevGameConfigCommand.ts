import { SetupGameConfigCommand } from '../../core/command/SetupGameConfigCommand';
import { Logger } from '../../core/utils/Logger';

export class SetupDevGameConfigCommand extends SetupGameConfigCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);

        this.gameDataProxy.resPath = '';
        if (window['servInfo'].enableDebugLog) {
            Logger.enable = window['servInfo'].enableDebugLog;
        }
    }
}
