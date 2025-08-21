import { CoreMsgCode } from '../constants/CoreMsgCode';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';
import { NetworkProxy } from '../proxy/NetworkProxy';
import { Logger } from '../utils/Logger';
import { ErrorCodeEvent } from '../vo/ErrorCodeEvent';

/**
 * 這邊專門處理SFS收到ErrorCode後 後續處理
 */
export class SFSErrorMsgByCodeCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'h5.error';

    public execute(notification: puremvc.INotification): void {
        const self = this;
        const body = notification.getBody();
        const errorCode: ErrorCodeEvent = body as ErrorCodeEvent;

        try {
            Logger.i('h5.error, code: ' + errorCode.code + ', message: ' + errorCode.message);
        } catch (e) {}

        switch (errorCode.code) {
            case CoreMsgCode.ERR_BALANCE_NOT_ENOUGH:
                self.networkProxy.sendNotEnoughMsgAndReload();
                break;
            default:
                self.webBridgeProxy.sendMsgCode(errorCode.code);
                break;
        }
    }

    protected _networkProxy: NetworkProxy;
    protected get networkProxy(): NetworkProxy {
        if (!this._networkProxy) {
            this._networkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._networkProxy;
    }

    private _webBridgeProxy: CoreWebBridgeProxy;
    public get webBridgeProxy(): CoreWebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
        }
        return this._webBridgeProxy;
    }
}
