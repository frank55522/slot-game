import { GameDataProxy } from '../../proxy/GameDataProxy';
import { GameStateProxyEvent } from '../../util/Constant';
import { WinBoardState } from '../../vo/enum/WinBoardState';

export class ChangeWinBoardStateCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'ChangeWinBoardStateCommand';

    public execute(notification: puremvc.INotification) {
        let state = notification.getBody() as WinBoardState;
        this.gameDataProxy.winBoardState = state;
        this.sendNotification(GameStateProxyEvent.ON_WIN_STATE_CHANGED, this.gameDataProxy.winBoardState);
    }

    // ======================== Get Set ========================
    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
