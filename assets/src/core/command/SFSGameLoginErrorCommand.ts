import { CoreMsgCode } from '../constants/CoreMsgCode';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';
import { GameLoginEvent } from '../vo/GameLoginEvent';

export class SFSGameLoginErrorCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'EV_GAME_LOGIN_ERROR';

    public execute(notification: puremvc.INotification): void {
        const gameLoginEvent = new GameLoginEvent(notification.getBody());
        const webBridgeProxy = this.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
        webBridgeProxy.sendMsgCode(CoreMsgCode.GAME_LOGIN[gameLoginEvent.code]);
    }
}
