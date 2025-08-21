import { _decorator, Component, Node } from 'cc';
import { CoreWebBridgeProxy } from '../../../core/proxy/CoreWebBridgeProxy';
import { Logger } from '../../../core/utils/Logger';
const { ccclass, property } = _decorator;

@ccclass('SendContainerMsgCommand')
export class SendContainerMsgCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'h5.sendContainerMsg';

    public execute(notification: puremvc.INotification): void {
        let data = notification.getBody();
        Logger.i(JSON.stringify(data));

        const webBridgeProxy = this.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
        webBridgeProxy.getWebFunRequest(this, 'handleServerMsg', data);
    }
}
