import { UIEvent } from 'common-ui/proxy/UIEvent';
import { ChangeBalanceCommand } from '../../../core/command/ChangeBalanceCommand';
import { GameDataProxy } from '../../proxy/GameDataProxy';
import { StateMachineProxy } from '../../proxy/StateMachineProxy';
import { WebBridgeProxy } from '../../proxy/WebBridgeProxy';

export class BalanceChangedCommand extends puremvc.SimpleCommand {
    public static NAME = ChangeBalanceCommand.EV_CHANGE_BALANCE;

    public execute(notification: puremvc.INotification) {
        if (this.checkUpdateHtmlCredit()) {
            this.sendNotification(UIEvent.UPDATE_PLAYER_BALANCE, this.gameDataProxy.cash);
        }
    }

    /** 確認是否可以更新HtmlCredit */
    protected checkUpdateHtmlCredit(): boolean {
        return this.gameDataProxy.gameState == StateMachineProxy.GAME1_IDLE;
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
    protected get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }
}
