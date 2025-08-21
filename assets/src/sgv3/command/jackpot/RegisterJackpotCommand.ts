import { JackpotPoolCommand } from './JackpotPoolCommand';
import { SendContainerMsgCommand } from './SendContainerMsgCommand';

export class RegisterJackpotCommand extends puremvc.SimpleCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);
        this.facade.registerCommand(JackpotPoolCommand.NAME, JackpotPoolCommand);
        this.facade.registerCommand(SendContainerMsgCommand.NAME, SendContainerMsgCommand);
    }
}
