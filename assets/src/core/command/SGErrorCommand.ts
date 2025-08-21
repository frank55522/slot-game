/**
 * TODO: 實作接到webBridgeProxy.sendMsgCode
 * 讓客製部份實作EV_MSG
 */
export class SGErrorCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'EV_SG_ERROR';
    public static readonly EV_MSG: string = 'EV_MSG';

    public execute(notification: puremvc.INotification): void {
        this.facade.sendNotification(SGErrorCommand.EV_MSG, notification.getBody());
    }
}
