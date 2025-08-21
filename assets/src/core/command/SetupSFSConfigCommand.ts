import { CoreGameDataProxy } from '../proxy/CoreGameDataProxy';
import { NetworkProxy } from '../proxy/NetworkProxy';
import { CoreWebBridgeProxy } from '../proxy/CoreWebBridgeProxy';
import { AccountStatusCommand } from './AccountStatusCommand';
import { ChangeBalanceCommand } from './ChangeBalanceCommand';
import { CoreSFDisconnectionCommand } from './CoreSFDisconnectionCommand';
import { SFLoginCommand } from './SFLoginCommand';
import { SFSGameLoginErrorCommand } from './SFSGameLoginErrorCommand';
import { SFTimeoutCommand } from './SFTimeoutCommand';
import { DEBUG } from 'cc/env';
import { IGameConfig } from '../vo/IGameConfig';
import { SettlePlayResponseCommand } from './SettlePlayResponseCommand';
import { LoadEvent } from '../../sgv3/vo/event/LoadEvent';
import { SFSErrorMsgByCodeCommand } from './SFSErrorMsgByCodeCommand';
import { SFConnectionCommand } from './SFConnectionCommand';
import { SentryTool } from '../utils/SentryTool';
import { GTMUtil } from '../utils/GTMUtil';

export class SetupSFSConfigCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'SetupSFSConfigCommand';
    private config: IGameConfig;
    private env: string = 'debug';

    public execute(notification: puremvc.INotification): void {
        this.config = {};
        if (DEBUG) {
            const ticket = this.getTicket();
            this.setupGameDataProxy(ticket);
            this.setupProxy(this.config, ticket);
            this.registerCommand();
        } else {
            this.getTicketRequest();
        }
    }

    public handleContainerMsg(e: MessageEvent) {
        if (JSON.parse(e.data).name === 'initTicket') {
            const ticket = JSON.parse(e.data).data;
            this.setupGameDataProxy(ticket);
            this.setupProxy(this.config, ticket);
            this.registerCommand();
            // 取得 Ticket 才通知 Loading View 連線
            if (!this.networkProxy.isConnected()) {
                this.sendNotification(LoadEvent.LOAD_GROUP_COMPLETE, LoadEvent.PRELOAD_GROUP);
            }
            // 註冊GA
            if (this.gameDataProxy.isDemoGame === false) {
                if (this.gameDataProxy.deployEnv === 'prod') {
                    GTMUtil.registerGTM('GTM-T2XTCNK9');
                } else {
                    GTMUtil.registerGTM('GTM-53Z8F4BH');
                }

                GTMUtil.setGTMEvent('GAInit', {
                    Member_ID: this.gameDataProxy.userId,
                    Game_ID: this.gameDataProxy.machineType,
                    DateTime: Date.now(),
                    Session_ID: this.gameDataProxy.sessionId
                });
            }

            // 設定Sentry環境
            SentryTool.init(this.gameDataProxy.gameVer, this.gameDataProxy.deployEnv);
            SentryTool.setUserID(this.gameDataProxy.userId);
        }
    }

    protected setupGameDataProxy(ticket: any) {
        this.gameDataProxy.gameType = ticket['gameType'];
        this.gameDataProxy.machineType = ticket['machineType'];
        this.gameDataProxy.currency = ticket['currency'];
        this.gameDataProxy.connectedTimeout = ticket['gameConnectionTimeout'];
        this.gameDataProxy.resLoadingTimeout = ticket['gameResourceTimeout'];
        this.gameDataProxy.userId = ticket['gameUid'];
    }

    protected getConfig(): IGameConfig {
        return this.config;
    }

    protected getTicket(): any {
        const webBridgeProxy = this.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
        return webBridgeProxy.getWebObj('initTicket');
    }

    protected getTicketRequest() {
        const webBridgeProxy = this.facade.retrieveProxy(CoreWebBridgeProxy.NAME) as CoreWebBridgeProxy;
        webBridgeProxy.getWebObjRequest(this, 'initTicket');
    }

    protected setupProxy(config: IGameConfig, otherData?: any): void {
        this.networkProxy.setConfig(config, otherData);
    }

    protected registerCommand(): void {
        const self = this;
        self.facade.registerCommand(SFLoginCommand.NAME, SFLoginCommand);
        self.facade.registerCommand(SFConnectionCommand.NAME, SFConnectionCommand);
        self.facade.registerCommand(CoreSFDisconnectionCommand.NAME, CoreSFDisconnectionCommand);
        self.facade.registerCommand(ChangeBalanceCommand.NAME, ChangeBalanceCommand);
        self.facade.registerCommand(AccountStatusCommand.NAME, AccountStatusCommand);
        self.facade.registerCommand(SFSGameLoginErrorCommand.NAME, SFSGameLoginErrorCommand);
        self.facade.registerCommand(SFTimeoutCommand.NAME, SFTimeoutCommand);
        self.facade.registerCommand(SettlePlayResponseCommand.NAME, SettlePlayResponseCommand);
        self.facade.registerCommand(SFSErrorMsgByCodeCommand.NAME, SFSErrorMsgByCodeCommand);
    }

    // ======================== Get Set ========================
    protected _networkProxy: NetworkProxy;
    protected get networkProxy(): NetworkProxy {
        if (!this._networkProxy) {
            this._networkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._networkProxy;
    }

    protected _gameDataProxy: CoreGameDataProxy;
    protected get gameDataProxy(): CoreGameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(CoreGameDataProxy.NAME) as CoreGameDataProxy;
        }
        return this._gameDataProxy;
    }
}
