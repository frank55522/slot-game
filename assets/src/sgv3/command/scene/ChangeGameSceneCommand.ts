import { GameDataProxy } from '../../proxy/GameDataProxy';
import { GameStateProxyEvent } from '../../util/Constant';

/**
 * 這隻負責轉場資料處理與通知
 */
export class ChangeGameSceneCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'ChangeGameSceneCommand';

    public execute(notification: puremvc.INotification) {
        let scene = notification.getBody() as string;
        this.gameDataProxy.preScene = this.gameDataProxy.curScene;
        this.gameDataProxy.curScene = scene;
        this.sendNotification(GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE);
        this.sendNotification(GameStateProxyEvent.ON_SCENE_CHANGED, this.gameDataProxy.curScene);
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
