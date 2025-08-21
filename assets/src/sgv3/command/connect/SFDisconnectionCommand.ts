import { CoreSFDisconnectionCommand } from '../../../core/command/CoreSFDisconnectionCommand';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';

/**
 * 客製化slot專屬斷線處理，之後會在StateMachine有直接斷線判斷，所以僅需要改寫直接關閉所有音效
 */
export class SFDisconnectionCommand extends CoreSFDisconnectionCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);

        this.reconnectStopNormalSound(notification.getBody());
    }

    /** 重連線時要關閉聲音 */
    protected reconnectStopNormalSound(evtParams: SFS2X.ICONNECTION_LOST): void {
        const self = this;
        let gameDataProxy = self.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        if (gameDataProxy && gameDataProxy.isMaintaining && evtParams.reason == 'manual') {
            self.stopNormalSound();
        }
    }

    /** 發出斷線訊息時要關閉所有一般音效 */
    protected sendMsgCode(): void {
        super.sendMsgCode();
        this.stopNormalSound();
    }

    /** 停止一般聲音 */
    protected stopNormalSound() {}

    // ======================== Get Set ========================
    protected _stateMachineProxy: StateMachineProxy;
    public get stateMachineProxy(): StateMachineProxy {
        if (!this._stateMachineProxy) {
            this._stateMachineProxy = this.facade.retrieveProxy(StateMachineProxy.NAME) as StateMachineProxy;
        }
        return this._stateMachineProxy;
    }
}
