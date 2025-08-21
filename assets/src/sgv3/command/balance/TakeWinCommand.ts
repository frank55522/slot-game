import { UIEvent } from 'common-ui/proxy/UIEvent';
import { NetworkProxy } from '../../../core/proxy/NetworkProxy';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { MathUtil } from 'src/core/utils/MathUtil';

export class TakeWinCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'TakeWinCommand';

    public execute(notification: puremvc.INotification): void {
        const self = this;

        let totalWin = self.gameDataProxy._tempWonCredit;
        this.sendNotification(UIEvent.UPDATE_PLAYER_BALANCE, MathUtil.add(this.gameDataProxy.cash, totalWin));
        // 滾分完畢，將贏分加入到balance欄位.
        self.gameDataProxy.resetTempWonCredit();

        this.networkProxy.sendSettlePlay(totalWin);
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
