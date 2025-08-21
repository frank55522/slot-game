import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
import { StateMachineProxy } from '../../sgv3/proxy/StateMachineProxy';
import { WebBridgeProxy } from '../../sgv3/proxy/WebBridgeProxy';
import { UIEvent } from 'common-ui/proxy/UIEvent';

export class ChangeBalanceCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'gs.changeBalance';

    public execute(notification: puremvc.INotification): void {
        const result = notification.getBody();
        let balance: number;
        let ts: number;
        if (notification.getBody() instanceof SFS2X.SFSObject) {
            const object = notification.getBody() as SFS2X.SFSObject;
            balance = object.getDouble('balance');
            ts = object.getLong('ts');
        } else {
            balance = result.balance;
            ts = result.ts;
        }

        if (ts > this.gameDataProxy.tsBmd && this.checkUpdateBalance()) {
            this.gameDataProxy.tsBmd = ts;
            this.gameDataProxy.setBmd(balance, true);
            this.sendNotification(UIEvent.UPDATE_PLAYER_BALANCE, this.gameDataProxy.cash);
        }
    }

    protected checkUpdateBalance(): boolean {
        return this.gameDataProxy.gameState == StateMachineProxy.GAME1_IDLE;
    }

    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected _webBridgeProxy: WebBridgeProxy;
    protected get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }
}
