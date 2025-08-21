import { CoreSGMaintenanceCommand } from '../../core/command/CoreSGMaintenanceCommand';

export class MockMaintenanceCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockMaintenanceCommand';

    public execute(notification: puremvc.INotification): void {
        this.sendNotification(CoreSGMaintenanceCommand.NAME);
    }
}
