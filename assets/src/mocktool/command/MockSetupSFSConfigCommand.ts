import { SetupSFSConfigCommand } from '../../core/command/SetupSFSConfigCommand';
import { NetworkProxy } from '../../core/proxy/NetworkProxy';
import { ISFSProxyConfig } from '../../core/vo/ISFSProxyConfig';

export class MockSetupSFSConfigCommand extends SetupSFSConfigCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);
        this.setupConfig();
    }

    protected setupConfig(): void {
        const netProxy: NetworkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        const config = netProxy.getConfig() as ISFSProxyConfig;
        const uid: string = netProxy.protocolProxy['uid'];
        const gameLoginName: string = netProxy.protocolProxy['gameLoginName'];

        config.gameUid = config.userName = config.uid = uid;
        config.gameLoginName = gameLoginName;
        netProxy.setConfig(config);
    }
}
