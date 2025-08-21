import { CoreMsgCode } from '../constants/CoreMsgCode';
import { CoreGameDataProxy } from '../proxy/CoreGameDataProxy';
import { CoreStateMachineProxy } from '../proxy/CoreStateMachineProxy';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';

export class AccountStatusMultipleLoginCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'ACCOUNT_STATUS_MULTIPLE_LOGIN';

    public execute(notification: puremvc.INotification): void {
        const webBridgeProxy: CoreWebBridgeProxy = this.facade.retrieveProxy(
            CoreWebBridgeProxy.NAME
        ) as CoreWebBridgeProxy;
        if (webBridgeProxy.isAccountStatusMultipleLogin && this.isCanShowErrorMessage()) {
            webBridgeProxy.isAccountStatusMultipleLogin = false;
            webBridgeProxy.sendMsgCode(CoreMsgCode.ACCOUNT_STATUS_MULTIPLE_LOGIN);
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
