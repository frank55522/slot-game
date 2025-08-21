import { DEBUG } from 'cc/env';
import { CoreStateMachineProxy } from '../proxy/CoreStateMachineProxy';
import { NetworkProxy } from '../proxy/NetworkProxy';
import { CoreSFDisconnectionCommand } from './CoreSFDisconnectionCommand';
import { IGameConfig } from '../vo/IGameConfig';
import { GameDataProxy } from '../../sgv3/proxy/GameDataProxy';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';
import { StateMachineProxy } from '../../sgv3/proxy/StateMachineProxy';
import { GTMUtil } from '../utils/GTMUtil';

export class SFReconnectCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'EV_RECONNECT';
    private retryTime: number = 0;
    private retryMaxTime: number = 2;
    private config: IGameConfig;
    private notification: any;

    public execute(notification: puremvc.INotification): void {
        const self = this;
        self.config = {};
        self.notification = notification.getBody();
        if (self.gameDataProxy.isReconnecting) {
            return;
        } else if (self.webBridgeProxy.isTriggerErrorCode) {
            self.sendNotification(CoreSFDisconnectionCommand.NAME, self.notification);
            return;
        }
        self.handleCommonStatus();
    }

    private handleCommonStatus(): void {
        const self = this;
        const state = self.gameDataProxy.gameState;
        const netProxy = self.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        const stateMachineProxy = self.facade.retrieveProxy(CoreStateMachineProxy.NAME) as CoreStateMachineProxy;
        const disconnectedState = stateMachineProxy.checkDisconnectedState(state);
        if (!netProxy.isConnected() && disconnectedState) {
            self.checkReconnect();
        } else {
            if (disconnectedState == undefined) {
                self.checkReconnect();
            }
        }
    }

    protected checkReconnect() {
        const self = this;
        if (DEBUG) {
            // Debug Cocos開發模式下,因為沒有Container,所以直接斷線, 有需要作重連的話, 直接使用Mock按鈕上的Reconnect
            self.sendNotification(CoreSFDisconnectionCommand.NAME, self.notification);
        } else {
            const self = this;
            const netProxy = self.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
            if (
                !netProxy.getSentSpinRequest() &&
                this.gameDataProxy.gameState != StateMachineProxy.GAME1_FEATURESELECTION
            ) {
                self.retryTime = 0;
                self.gameDataProxy.isReconnecting = true;
                self.countdownDisconnect();
                self.sendGetTicketRequest();
                self.registeringGetTicketRequest();

                GTMUtil.setGTMEvent('Reconnect', {
                    Member_ID: self.gameDataProxy.userId,
                    Game_ID: self.gameDataProxy.machineType,
                    DateTime: Date.now(),
                    Session_ID: self.gameDataProxy.sessionId,
                });
            } else {
                self.sendNotification(CoreSFDisconnectionCommand.NAME, self.notification);
            }
        }
    }

    protected registeringGetTicketRequest(time: number = 5000) {
        const self = this;
        if (self.retryTime >= self.retryMaxTime) {
            return;
        }
        self.networkProxy.getTicketRegister = setTimeout(() => {
            self.retryTime++;
            self.sendGetTicketRequest();
            self.registeringGetTicketRequest();
        }, time);
    }

    public countdownDisconnect(time: number = 15000): void {
        const self = this;
        self.networkProxy.reconnectionRegister = setTimeout(() => {
            self.webBridgeProxy.getWebObjRequest(this, 'reconnectFinished');
            self.networkProxy.reconnectFail();
            self.sendNotification(CoreSFDisconnectionCommand.NAME);
        }, time);
    }

    public handleContainerMsg(e: MessageEvent) {
        if (JSON.parse(e.data).name === 'updateTicket') {
            const ticket = JSON.parse(e.data).data;
            this.setupGameDataProxy(ticket);
            this.setupProxy(this.config, ticket);
            // 取得 Ticket 才進行Reconnect
            if (!this.networkProxy.isConnected()) {
                this.networkProxy.reconnect();
            }
            if (this.webBridgeProxy.listenerMap.has('reconnect')) {
                this.webBridgeProxy.listenerMap.delete('reconnect');
            }
        }
    }

    protected setupGameDataProxy(ticket: any) {
        this.gameDataProxy.gameType = ticket['gameType'];
        this.gameDataProxy.machineType = ticket['machineType'];
        this.gameDataProxy.currency = ticket['currency'];
        this.gameDataProxy.connectedTimeout = ticket['gameConnectionTimeout'];
        this.gameDataProxy.resLoadingTimeout = ticket['gameResourceTimeout'];
    }

    protected sendGetTicketRequest() {
        this.webBridgeProxy.listenerMap.set('updateTicket', this);
        this.webBridgeProxy.getWebObjRequest(this, 'reconnect');
    }

    protected setupProxy(config: IGameConfig, otherData?: any): void {
        this.networkProxy.setConfig(config, otherData);
    }

    // ======================== Get Set ========================
    protected _networkProxy: NetworkProxy;
    protected get networkProxy(): NetworkProxy {
        if (!this._networkProxy) {
            this._networkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._networkProxy;
    }

    protected _webBridgeProxy: CoreWebBridgeProxy;
    protected get webBridgeProxy(): CoreWebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
        }
        return this._webBridgeProxy;
    }

    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
