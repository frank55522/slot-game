import { CoreMsgCode } from '../constants/CoreMsgCode';
import { CoreGameDataProxy } from '../proxy/CoreGameDataProxy';
import { NetworkProxy } from '../proxy/NetworkProxy';
import { CoreStateMachineProxy } from '../proxy/CoreStateMachineProxy';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';

/**
 * 進入此類別時，已與伺服器斷線
 * 依照是否維護及是否顯示斷線來判定斷線的流程
 */
export class CoreSFDisconnectionCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'EV_DISCONNECTION';
    private gameDataProxy: CoreGameDataProxy;

    public execute(notification: puremvc.INotification): void {
        const self = this;
        const gameDataProxy = self.getGameDataProxy();
        if (gameDataProxy.isMaintaining) {
            // TODO: Server 維護時的主動斷線暫不做處理，避免 Error code 在遊玩中直接出現
            // self.handleMaintenance(notification.getBody());
        } else {
            self.handleCommonStatus();
        }
    }

    private getGameDataProxy(): CoreGameDataProxy {
        const self = this;
        if (!self.gameDataProxy) {
            self.gameDataProxy = self.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
        }
        return self.gameDataProxy;
    }

    protected sendMsgCode(code = CoreMsgCode.ERR_SFS_DISCONNECT): void {
        const self = this;
        const gameDataProxy = self.getGameDataProxy();
        const webBridgeProxy = self.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
        gameDataProxy.isMaintaining = false;
        webBridgeProxy.getWebObjRequest(this, 'reconnectFinished');
        webBridgeProxy.sendMsgCode(code);
    }

    private handleCommonStatus(): void {
        const self = this;
        const gameDataProxy = self.getGameDataProxy();
        const state = gameDataProxy.gameState;
        const netProxy = self.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        const stateMachineProxy = self.facade.retrieveProxy(CoreStateMachineProxy.NAME) as CoreStateMachineProxy;
        const disconnectedState = stateMachineProxy.checkDisconnectedState(state);
        if (!netProxy.isConnected() && disconnectedState) {
            self.sendMsgCode();
        } else {
            if (disconnectedState == undefined) {
                self.sendMsgCode();
            }
        }
    }
}
