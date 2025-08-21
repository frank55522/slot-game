import { Logger } from '../../core/utils/Logger';

export class SetupLoggerErrorCommand extends puremvc.SimpleCommand {
    public execute(notification: puremvc.INotification): void {
        Logger['_e'] = this.handleExtraAction;
    }

    private handleExtraAction(log): void {
        window.alert(log);
    }
}
