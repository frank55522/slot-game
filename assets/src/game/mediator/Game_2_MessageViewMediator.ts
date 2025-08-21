import { _decorator } from 'cc';
import BaseMediator from 'src/base/BaseMediator';
import { Game_2_MessageView } from '../view/Game_2_MessageView';
import { GameStateProxyEvent } from 'src/sgv3/util/Constant';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
import { GameScene } from 'src/sgv3/vo/data/GameScene';
const { ccclass } = _decorator;

@ccclass('Game_2_MessageViewMediator')
export class Game_2_MessageViewMediator extends BaseMediator<Game_2_MessageView> {
    protected lazyEventListener(): void {
        this.view.node.active = false;
    }

    public listNotificationInterests(): string[] {
        return [GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE:
                this.setMessage();
                break;
        }
    }

    private setMessage() {
        if (this.gameDataProxy.curScene == GameScene.Game_2) {
            this.view.node.active = true;
        } else {
            this.view.node.active = false;
        }
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
