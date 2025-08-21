import { CoreGameDataProxy } from '../proxy/CoreGameDataProxy';
import { CoreSGGameLoginReturn } from '../vo/CoreSGGameLoginReturn';
import { SFConnectionCommand } from './SFConnectionCommand';
import { SFSGameLoginErrorCommand } from './SFSGameLoginErrorCommand';

export class SFLoginCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'gameLoginReturn';

    public execute(notification: puremvc.INotification): void {
        const self = this;
        const body: SFS2X.SFSObject = notification.getBody();
        const gameLoginReturn: CoreSGGameLoginReturn = new CoreSGGameLoginReturn(body);
        const isConnected = gameLoginReturn.data;
        if (isConnected) {
            const gameDataProxy = self.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
            gameDataProxy.setBmd(gameLoginReturn.balance, true);
            gameDataProxy.hasTestMode = gameLoginReturn.testMode;
            self.facade.sendNotification(SFConnectionCommand.NAME, gameLoginReturn);
        } else {
            self.facade.sendNotification(SFSGameLoginErrorCommand.NAME, body);
        }
    }
}
