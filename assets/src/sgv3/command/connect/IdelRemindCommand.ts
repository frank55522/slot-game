import { CoreMsgCode } from '../../../core/constants/CoreMsgCode';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';

/**
 * 處理閒置斷線處理
 */
export class IdelRemindCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'gs.IDLE_REMIND';

    public execute(notification: puremvc.INotification): void {
        this.gameDataProxy.isIdleReminding = true;
        if (this.stateMachineProxy.checkIdleRemind()) {
            this.gameDataProxy.isIdleReminding = false;
            let webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
            webBridgeProxy.sendMsgCode(CoreMsgCode.IDLE_REMIND);
        }
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _stateMachineProxy: StateMachineProxy;
    protected get stateMachineProxy(): StateMachineProxy {
        if (!this._stateMachineProxy) {
            this._stateMachineProxy = this.facade.retrieveProxy(StateMachineProxy.NAME) as StateMachineProxy;
        }
        return this._stateMachineProxy;
    }
}
