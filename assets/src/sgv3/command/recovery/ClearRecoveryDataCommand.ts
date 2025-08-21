import { NetworkProxy } from '../../../core/proxy/NetworkProxy';
import { GameDataProxy } from '../../proxy/GameDataProxy';

export class ClearRecoveryDataCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'ClearRecoveryDataCommand';

    public execute(notification: puremvc.INotification): void {
        //清除 Recovery相關的資料參數
        this.gameDataProxy.reStateResult = null;
        this.networkProxy.resetSettlePlayState();
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
    protected _networkProxy: NetworkProxy;
    protected get networkProxy(): NetworkProxy {
        if (!this._networkProxy) {
            this._networkProxy = this.facade.retrieveProxy(NetworkProxy.NAME) as NetworkProxy;
        }
        return this._networkProxy;
    }
}
