import { WinEvent } from '../util/Constant';
import { GameDataProxy } from '../proxy/GameDataProxy';

export class CheckShowWinComplete extends puremvc.SimpleCommand {
    public static NAME = WinEvent.SHOW_WIN_ASSEMBLE_COMPLETE;
    protected timerName = 'WinBoardRunComplete';

    public execute(notification: puremvc.INotification): void {
        this.gameDataProxy.showWinOnceComplete = true;
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
