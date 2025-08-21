import { SFDisconnectionCommand } from '../connect/SFDisconnectionCommand';
import { SGMaintenanceCommand } from '../connect/SGMaintenanceCommand';

export class RegisterSlotDisconnectCommand extends puremvc.SimpleCommand {
    public execute(notification: puremvc.INotification): void {
        // 這邊補上直接斷線處理
        this.facade.registerCommand(SFDisconnectionCommand.NAME, SFDisconnectionCommand);
        this.facade.registerCommand(SGMaintenanceCommand.NAME, SGMaintenanceCommand);
    }
}
