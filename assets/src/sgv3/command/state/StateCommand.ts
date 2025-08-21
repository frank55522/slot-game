import { StateMachineCommand } from '../../../core/command/StateMachineCommand';
import { StateMachineObject } from '../../../core/proxy/CoreStateMachineProxy';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';

export class StateCommand extends puremvc.SimpleCommand {
    public execute(notification: puremvc.INotification): void {}

    protected notifyWebControl(): void {
        const self = this;
        self.webBridgeProxy.notifyWebControlBtnEnable();
        self.webBridgeProxy.notifyWebMenuBtnEnable();
    }

    protected changeState(state: string, body?: any): void {
        this.sendNotification(StateMachineCommand.NAME, new StateMachineObject(state, body));
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _webBridgeProxy: WebBridgeProxy;
    public get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }

    protected _stateMachineProxy: StateMachineProxy;
    public get stateMachineProxy(): StateMachineProxy {
        if (!this._stateMachineProxy) {
            this._stateMachineProxy = this.facade.retrieveProxy(StateMachineProxy.NAME) as StateMachineProxy;
        }
        return this._stateMachineProxy;
    }
}
