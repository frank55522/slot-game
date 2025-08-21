import { NetworkProxy } from '../../core/proxy/NetworkProxy';

export class MockDisconnectionCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockDisconnectionCommand';

    public execute(notification: puremvc.INotification): void {
        this.netProxy.disconnect();
    }

    /**  get */
    protected _NetProxy: NetworkProxy;
    protected get netProxy(): NetworkProxy {
        if (this._NetProxy == null) {
            this._NetProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._NetProxy;
    }
}
