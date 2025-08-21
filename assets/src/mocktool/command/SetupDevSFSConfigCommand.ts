import { SetupSFSConfigCommand } from '../../core/command/SetupSFSConfigCommand';
import { NetworkProxy } from '../../core/proxy/NetworkProxy';
import { ISFSProxyConfig } from '../../core/vo/ISFSProxyConfig';
import { LoadEvent } from '../../sgv3/vo/event/LoadEvent';

export class SetupDevSFSConfigCommand extends SetupSFSConfigCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);

        let config: ISFSProxyConfig = this.getConfig();

        let rndUid: number = Math.floor(Math.random() * 2999) + 1000;
        
        this.saveLoginInfo(config);

        // 更新userInfo
        window['userInfo']['uid'] = config.uid;

        // 取得 Ticket 才通知 Loading View 連線
        if (!this.netProxy().isConnected()) {
            this.sendNotification(LoadEvent.LOAD_GROUP_COMPLETE, LoadEvent.PRELOAD_GROUP);
        }
    }

    protected saveLoginInfo(config: ISFSProxyConfig): void {
        const proxy = this.netProxy();
        proxy.protocolProxy['uid'] = config.uid;
        proxy.protocolProxy['gameLoginName'] = config.gameLoginName;
    }

    protected netProxy(): NetworkProxy {
        return this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
    }
}
