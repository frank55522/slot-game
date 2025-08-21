import { GameDataProxy } from '../../sgv3/proxy/GameDataProxy';
import { SGGameLoginReturn } from '../../sgv3/vo/result/SGGameLoginReturn';
import { NetworkProxy } from '../proxy/NetworkProxy';
import { ChangeBalanceCommand } from './ChangeBalanceCommand';

export class SFConnectionCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'EV_CONNECTION';
    public execute(notification: puremvc.INotification): void {
        this.onConnectServer(notification);
        this.gameDataProxy.loadUserSetting();
    }

    /** slot 需要取得initData後才行 */
    protected onConnectServer(notification: puremvc.INotification): void {
        let gameLoginReturn: SGGameLoginReturn = notification.getBody() as SGGameLoginReturn;
        // refactor 之後繼承SFSLoginCommand處理
        this.gameDataProxy.setBmd(gameLoginReturn.balance, true);
        this.sendNotification(ChangeBalanceCommand.NAME, gameLoginReturn);
        // slot 必須在連線後送出初始化要求封包才能繼續做
        this.netProxy.sendInitRequest();
    }

    protected _netProxy: NetworkProxy;
    public get netProxy(): NetworkProxy {
        return this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
    }

    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
