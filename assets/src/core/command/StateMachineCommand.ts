import { NetworkProxy } from '../proxy/NetworkProxy';
import { StateMachineObject, CoreStateMachineProxy } from '../proxy/CoreStateMachineProxy';
import { CoreSGMaintenanceCommand } from './CoreSGMaintenanceCommand';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';
import { AccountStatusMultipleLoginCommand } from './AccountStatusMultipleLoginCommand';
import { CoreGameDataProxy } from '../proxy/CoreGameDataProxy';
import { SFReconnectCommand } from './SFReconnectCommand';
import { CheckNormalButtonStateCommand } from 'src/game/command/CheckNormalButtonStateCommand';

export class StateMachineCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'StateMachineCommand';
    public static readonly EV_FAILED_STATE: string = 'EV_FAILED_STATE';
    private gameDataProxy: CoreGameDataProxy;
    private stateMachineProxy: CoreStateMachineProxy;

    public execute(notification: puremvc.INotification): void {
        const self = this;
        const gameDataProxy = self.getGameDataProxy();
        const stateMachineProxy = self.getStateMachineProxy();
        let currentState: string = gameDataProxy.gameState;
        let targetObj: StateMachineObject = notification.getBody();
        let isLegal = stateMachineProxy.checkState(currentState, targetObj.gameState);
        if (isLegal) {
            while (targetObj) {
                if (stateMachineProxy.lockState(targetObj)) {
                    self.changeState(targetObj);
                    self.handleCommonStatus();
                    targetObj = stateMachineProxy.unlockState();
                } else {
                    break;
                }
            }
        } else {
            self.sendNotification(StateMachineCommand.EV_FAILED_STATE);
        }
        this.sendNotification(CheckNormalButtonStateCommand.NAME);
    }

    private changeState(obj: StateMachineObject): void {
        const self = this;
        const gameDataProxy = self.getGameDataProxy();
        const stateMachineProxy = self.getStateMachineProxy();
        gameDataProxy.gameState = obj.gameState;
        stateMachineProxy.changeState(obj);
    }

    private handleCommonStatus(): void {
        const self = this;
        const gameDataProxy = self.getGameDataProxy();
        const webBridgeProxy: CoreWebBridgeProxy = this.facade.retrieveProxy(
            CoreWebBridgeProxy.NAME
        ) as CoreWebBridgeProxy;
        if (gameDataProxy.isMaintaining) {
            self.facade.sendNotification(CoreSGMaintenanceCommand.NAME);
        } else if (webBridgeProxy.isAccountStatusMultipleLogin) {
            self.facade.sendNotification(AccountStatusMultipleLoginCommand.NAME);
        } else {
            const netProxy = self.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
            if (!gameDataProxy.isReconnecting && !netProxy.isConnected()) {
                self.facade.sendNotification(SFReconnectCommand.NAME);
            }
        }
    }

    private getGameDataProxy(): CoreGameDataProxy {
        const self = this;
        if (!self.gameDataProxy) {
            self.gameDataProxy = self.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
        }
        return self.gameDataProxy;
    }

    private getStateMachineProxy(): CoreStateMachineProxy {
        const self = this;
        if (!self.stateMachineProxy) {
            self.stateMachineProxy = self.facade.retrieveProxy(CoreStateMachineProxy.NAME) as CoreStateMachineProxy;
        }
        return self.stateMachineProxy;
    }
}
