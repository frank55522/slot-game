import { CoreMsgCode } from '../constants/CoreMsgCode';
import { NetworkProxy } from '../proxy/NetworkProxy';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';
import { SFReconnectCommand } from './SFReconnectCommand';

export class SFTimeoutCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'SFTimeoutCommand';

    public execute(notification: puremvc.INotification): void {
        const self = this;
        const state = notification.getBody();
        if (self.checkRetriedStatus(state)) {
            self.facade.sendNotification(SFReconnectCommand.NAME);
        } else {
            const webBridge = this.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
            webBridge.sendMsgCode(CoreMsgCode.ERR_SFS_CONNECT_TIMEOUT);
        }
    }
    /**
     * 當在SFSProxy狀態為CONNECTING時觸發斷線，代表在與SmartFox server連線失敗
     * 而retry次數未達上限時，使用維護流程實作重連
     */
    private checkRetriedStatus(state: string): boolean {
        const self = this;
        const netProxy = self.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        if (state == NetworkProxy.STATE_CONNECTING) {
            if (!netProxy.hasRetried()) {
                return true;
            }
        }
        return false;
    }
}
