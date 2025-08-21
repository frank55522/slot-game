import { CoreMsgCode } from '../constants/CoreMsgCode';
import { CoreGameDataProxy } from '../proxy/CoreGameDataProxy';
import { NetworkProxy } from '../proxy/NetworkProxy';
import { CoreStateMachineProxy } from '../proxy/CoreStateMachineProxy';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';
import { SetupSFSConfigCommand } from './SetupSFSConfigCommand';

export class CoreSGMaintenanceCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'maintenanceAnnounce';
    private netProxy: NetworkProxy;

    public execute(notification: puremvc.INotification): void {
        const ticket = notification.getBody();
        if (ticket && ticket['gsInfo']) {
            this.reconnect(ticket);
        } else {
            this.updateTicket();
        }
    }

    private reconnect(ticket: any): void {
        const self = this;
        self.facade.sendNotification(SetupSFSConfigCommand.NAME, ticket);
        const gameDataProxy = self.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
        const netProxy: NetworkProxy = self.getNetProxy();
        if (!netProxy.isConnected() && gameDataProxy.isReconnecting) {
            netProxy.connect();
        } else {
            netProxy.disconnect();
        }
    }

    private updateTicket(): void {
        const self = this;
        const gameDataProxy = self.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
        gameDataProxy.isMaintaining = true;
        const state = gameDataProxy.gameState;
        const stateMachineProxy = self.facade.retrieveProxy(CoreStateMachineProxy.NAME) as CoreStateMachineProxy;
        const netProxy = self.getNetProxy();
        if (!netProxy.isConnected() && stateMachineProxy.checkDisconnectedState(state)) {
            gameDataProxy.isMaintaining = false;
            const netProxy = self.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
            netProxy.disconnect();
        } else if (stateMachineProxy.checkMaintenanceState(state)) {
            let webBridgeProxy: CoreWebBridgeProxy = self.facade.retrieveProxy(
                CoreWebBridgeProxy.NAME
            ) as CoreWebBridgeProxy;
            webBridgeProxy.sendMsgCode(CoreMsgCode.GAME_LOGIN_FAILED_GAME_MAINTAIN);
            webBridgeProxy.updateTicket();
        }
    }

    protected getNetProxy(): NetworkProxy {
        const self = this;
        if (!self.netProxy) {
            self.netProxy = self.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return self.netProxy;
    }
}
