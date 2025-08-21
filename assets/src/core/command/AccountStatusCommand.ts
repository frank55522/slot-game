import { CoreMsgCode } from '../constants/CoreMsgCode';
import { CoreGameDataProxy } from '../proxy/CoreGameDataProxy';
import { CoreStateMachineProxy } from '../proxy/CoreStateMachineProxy';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';

export class AccountStatusCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'gs.SC_ACCOUNT_STATUS';

    public execute(notification: puremvc.INotification): void {
        const webBridgeProxy: CoreWebBridgeProxy = this.facade.retrieveProxy(
            CoreWebBridgeProxy.NAME
        ) as CoreWebBridgeProxy;
        const result = notification.getBody() as SFS2X.SFSObject;
        const status_code: number = CoreMsgCode.ACCOUNT_STATUS[result.getInt('status_code')];
        const err_msg: number = result.getInt('err_msg');
        webBridgeProxy.isTriggerErrorCode = true;
        // 若遇到重複登入狀況 需延後跳出Error訊息 需先保存狀態
        if (status_code == CoreMsgCode.ACCOUNT_STATUS_MULTIPLE_LOGIN && !this.isCanShowErrorMessage()) {
            webBridgeProxy.isAccountStatusMultipleLogin = true;
        } else {
            webBridgeProxy.sendMsgCode(status_code, err_msg);
        }
    }

    private isCanShowErrorMessage() {
        const self = this;
        const gameDataProxy = this.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
        const state = gameDataProxy.gameState;
        const stateMachineProxy = self.facade.retrieveProxy(CoreStateMachineProxy.NAME) as CoreStateMachineProxy;
        return stateMachineProxy.checkDisconnectedState(state);
    }
}
