import { _decorator, Component, Node } from 'cc';
import { NetworkProxy } from '../../core/proxy/NetworkProxy';
import { CoreWebBridgeProxy } from '../../core/proxy/CoreWebBridgeProxy';
import { CoreGameDataProxy } from '../../core/proxy/CoreGameDataProxy';
import { CoreSFDisconnectionCommand } from '../../core/command/CoreSFDisconnectionCommand';
const { ccclass, property } = _decorator;

@ccclass('MockReconnectCommand')
export class MockReconnectCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockReconnectCommand';

    public execute(notification: puremvc.INotification): void {
        const self = this;
        const netProxy = self.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        const webBridgeProxy = self.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
        const gameDataProxy = self.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
        if (gameDataProxy.isReconnecting) {
            return;
        }
        if (!netProxy.getSentSpinRequest()) {
            gameDataProxy.isReconnecting = true;
            this.netProxy.reconnect();
        } else {
            self.sendNotification(CoreSFDisconnectionCommand.NAME);
        }
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

