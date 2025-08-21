import { NetworkProxy } from '../proxy/NetworkProxy';
import { Logger } from '../utils/Logger';
import { SaveDataResponseObject } from '../vo/SaveDataResponseObject';

export class SaveDataResponseCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'h5.saveDataResponse';

    public execute(notification: puremvc.INotification): void {
        Logger.i('[SaveDataResponseCommand] Execute');
        let saveDataResponse: SaveDataResponseObject = notification.getBody();

        if (saveDataResponse.result != 'OK') {
            Logger.e('[Error] SAVE_DATE IS FAIL!?');
        }
    }

    protected _networkProxy: NetworkProxy;
    protected get networkProxy(): NetworkProxy {
        if (!this._networkProxy) {
            this._networkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._networkProxy;
    }
}
