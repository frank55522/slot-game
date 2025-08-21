import { _decorator } from 'cc';
import { AutoPlayClickOptionCommand } from '../autoplay/AutoPlayClickOptionCommand';
import { SpinRequestCommand } from '../spin/SpinRequestCommand';
import { CoreWebBridgeProxy } from '../../../core/proxy/CoreWebBridgeProxy';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { NetworkProxy } from '../../../core/proxy/NetworkProxy';
import { GTMUtil } from 'src/core/utils/GTMUtil';

/**
 * 在Reconnect結束後恢復連線時, 當下狀態判斷進行處理的Commond
 */
export class AfterReconnectionCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'AFTER_RECONNECTION';

    public execute(notification: puremvc.INotification): void {
        const webBridgeProxy = this.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
        webBridgeProxy.getWebObjRequest(this, 'reconnectFinished');
        clearTimeout(this.networkProxy.getTicketRegister);
        clearTimeout(this.networkProxy.reconnectionRegister);
        this.gameDataProxy.isReconnecting = false;
        this.networkProxy.resetSendSpinState();
        if (this.gameDataProxy.isSpinning) {
            this.sendNotification(SpinRequestCommand.NAME);
        }

        GTMUtil.setGTMEvent('AfterReconnection', {
            Member_ID: this.gameDataProxy.userId,
            Game_ID: this.gameDataProxy.machineType,
            DateTime: Date.now(),
            Session_ID: this.gameDataProxy.sessionId,
        });
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _networkProxy: NetworkProxy;
    protected get networkProxy(): NetworkProxy {
        if (!this._networkProxy) {
            this._networkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._networkProxy;
    }
}
