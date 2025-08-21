import { _decorator } from 'cc';
import { GameDataProxy } from '../../proxy/GameDataProxy';

const { ccclass } = _decorator;

@ccclass('CloseHelpCommand')
export class CloseHelpCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'CloseHelpCommand';

    public execute(notification: puremvc.INotification) {
        this.gameDataProxy.isHelpOpen = false;
    }

    // ======================== Get Set ========================
    private _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }

        return this._gameDataProxy;
    }
}
