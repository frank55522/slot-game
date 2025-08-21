import { CoreSGMaintenanceCommand } from '../../../core/command/CoreSGMaintenanceCommand';
import { CoreMsgCode } from '../../../core/constants/CoreMsgCode';
import { NetworkProxy } from '../../../core/proxy/NetworkProxy';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';
import { MaintainGame1ShowwinCommand } from './MaintainGame1ShowwinCommand';

/** Server通知要進維護處理，因應斷線重連線機制進行slot客製化調整
 */
export class SGMaintenanceCommand extends CoreSGMaintenanceCommand {
    public execute(notification: puremvc.INotification): void {
        this.customFunc();
        super.execute(notification);
        this.checkGame1Showwin();
    }

    protected customFunc() {
        SGMaintenanceCommand.prototype['updateTicket'] = function () {
            const self = this;

            const gameDataProxy = self.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
            gameDataProxy.isMaintaining = true;

            const state = gameDataProxy.gameState;
            const stateMachineProxy = self.facade.retrieveProxy(StateMachineProxy.NAME) as StateMachineProxy;
            const netProxy = self.getNetProxy();

            if (stateMachineProxy.checkMaintenanceState(state)) {
                let webBridgeProxy: WebBridgeProxy = self.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
                webBridgeProxy.sendMsgCode(CoreMsgCode.GAME_LOGIN_FAILED_GAME_MAINTAIN);
                webBridgeProxy.updateTicket();
            } else if (!netProxy.isConnected() && stateMachineProxy.checkDisconnectedState(state) || netProxy.isConnected()) {
                self.notifyErrorCodeOne();
            }
        };
    }

    public notifyErrorCodeOne() {
        const self = this;
        const netProxy = self.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        netProxy.disconnect();
    }

    /** 確認Game1Show是否可以透過MaintainGame1ShowwinCommand 轉換到下個階段 */
    protected checkGame1Showwin() {
        if (this.stateMachineProxy.checkMaintenanceGame1Showwin()) {
            this.sendNotification(MaintainGame1ShowwinCommand.NAME);
        }
    }

    // ======================== Get Set ========================
    protected _stateMachineProxy: StateMachineProxy;
    public get stateMachineProxy(): StateMachineProxy {
        if (!this._stateMachineProxy) {
            this._stateMachineProxy = this.facade.retrieveProxy(StateMachineProxy.NAME) as StateMachineProxy;
        }
        return this._stateMachineProxy;
    }

    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
